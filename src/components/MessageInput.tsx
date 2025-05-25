import { useState } from 'react'
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi'

interface MessageInputProps {
  onSend: (content: string) => void
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
      <div className="flex items-center">
        <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
          <FiPaperclip size={20} />
        </button>
        <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
          <FiSmile size={20} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 mx-2 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-periskope"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-2 text-periskope hover:text-indigo-700 disabled:text-gray-400"
        >
          <FiSend size={20} />
        </button>
      </div>
    </form>
  )
}
