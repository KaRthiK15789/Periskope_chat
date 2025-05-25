'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Chat, Message } from '@/lib/types'
import ChatList from './ChatList'
import MessageInput from './MessageInput'
import { FiMenu, FiSearch, FiPaperclip, FiMoreVertical } from 'react-icons/fi'

export default function Chat() {
  const [user, setUser] = useState<User | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0]
        })
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          chats (
            id,
            created_at,
            last_message,
            last_message_at,
            participants:chat_participants!chat_id(user_id, users!user_id(id, email, name))
          )
        `)
        .eq('user_id', user.id)

      if (data) {
        const formattedChats = data.map(item => ({
          id: item.chat_id,
          created_at: item.chats.created_at,
          last_message: item.chats.last_message,
          last_message_at: item.chats.last_message_at,
          participants: item.chats.participants.map((p: any) => p.users)
        }))
        setChats(formattedChats)
        setLoading(false)
      }
    }

    fetchChats()
  }, [user])

  useEffect(() => {
    if (!activeChat) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          chat_id,
          sender_id,
          content,
          created_at,
          sender:users!sender_id(id, email, name)
        `)
        .eq('chat_id', activeChat)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
      }
    }

    fetchMessages()

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${activeChat}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [activeChat])

  const handleSendMessage = async (content: string) => {
    if (!user || !activeChat || !content.trim()) return

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        chat_id: activeChat,
        sender_id: user.id,
        content
      }])
      .select()

    if (data) {
      // Update last message in chat
      await supabase
        .from('chats')
        .update({ 
          last_message: content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', activeChat)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-periskope"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/assets/periskope-logo.png" 
              alt="Periskope" 
              className="h-8 mr-2"
            />
            <h2 className="font-semibold text-lg">Chats</h2>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <FiMenu size={20} />
          </button>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats"
              className="w-full pl-8 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-periskope"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        <ChatList 
          chats={chats} 
          activeChat={activeChat}
          onSelectChat={setActiveChat}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-periskope text-white flex items-center justify-center">
                  {chats.find(c => c.id === activeChat)?.participants
                    .filter((p: User) => p.id !== user?.id)[0]?.name.charAt(0) || '?'}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">
                    {chats.find(c => c.id === activeChat)?.participants
                      .filter((p: User) => p.id !== user?.id)
                      .map((p: User) => p.name)
                      .join(', ')}
                  </h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <div className="flex space-x-4 text-gray-500">
                <button className="hover:text-gray-700">
                  <FiSearch size={20} />
                </button>
                <button className="hover:text-gray-700">
                  <FiMoreVertical size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5]">
              <div className="space-y-2">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender_id === user?.id ? 'bg-periskope text-white' : 'bg-white'}`}
                    >
                      {message.sender_id !== user?.id && (
                        <p className="text-xs font-medium text-gray-700">
                          {message.sender?.name}
                        </p>
                      )}
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <MessageInput 
              onSend={handleSendMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6 max-w-md">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No chat selected</h3>
              <p className="text-gray-500">Choose a chat from the sidebar or start a new conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
