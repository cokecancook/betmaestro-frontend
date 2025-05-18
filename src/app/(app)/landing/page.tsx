
import Chatbot from '@/components/chatbot/Chatbot';

export default function LandingPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Chatbot takes full height below TopMenu */}
      <Chatbot />
    </div>
  );
}
