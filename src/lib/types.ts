export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
}

export interface Chat {
  id: string
  created_at: string
  last_message?: string
  last_message_at?: string
  participants: User[]
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
  sender: User
}
