import ChatBox from '../../components/ChatBox';

export default function Chat() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chatbox</h1>
          <p className="text-gray-600">
            Trò chuyện với AI để tìm kiếm template phù hợp với nhu cầu của bạn
          </p>
        </div>
        <ChatBox />
      </div>
    </div>
  );
}

