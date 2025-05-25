import { Chat } from '@/lib/types'
import { FiCheck, FiMessageSquare } from 'react-icons/fi'

interface ChatListProps {
  chats: Chat[]
  activeChat: string | null
  onSelectChat: (id: string) => void
}

export default function ChatList({ chats, activeChat, onSelectChat }: ChatListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map(chat => (
        <div
          key={chat.id}
          className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center ${
            activeChat === chat.id ? 'bg-gray-100' : ''
          }`}
          onClick={() => onSelectChat(chat.id)}
        >
          <div className="w-12 h-12 rounded-full bg-periskope text-white flex items-center justify-center mr-3">
            {chat.participants[0]?.name.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h4 className="font-medium truncate">
                {chat.participants.map(p => p.name).join(', ')}
              </h4>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {new Date(chat.last_message_at || chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 truncate">
                {chat.last_message || 'New chat'}
              </p>
              <FiCheck className="text-gray-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
