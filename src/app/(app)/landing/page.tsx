
import Chatbot from '@/components/chatbot/Chatbot';

export default function LandingPage() {
  return (
    <div className="container mx-auto h-full py-0 px-0 sm:px-0 md:px-0 lg:px-0 max-w-full">
      {/* Chatbot takes full height below TopMenu */}
      <Chatbot />
    </div>
  );
}
