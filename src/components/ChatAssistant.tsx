import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User as UserIcon, 
  Calendar as CalendarIcon, 
  Wrench, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { CurrentUser, ChatMessage, ToolCallExecution } from '../types.js';

interface ChatAssistantProps {
  currentUser: CurrentUser;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onRefreshData?: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentUser,
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  const toggleToolExpand = (id: string) => {
    setExpandedTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const studentPrompts = [
    { label: 'Search AI workshops', text: 'Which AI workshops are happening this month?' },
    { label: 'Register for AI workshop', text: 'Register me for the AI workshop.' },
    { label: 'Check registration', text: 'Am I registered for the Business Analytics Workshop?' },
    { label: 'Show my registrations', text: 'Show my registrations.' },
    { label: 'Check seats & count', text: 'How many students have registered for the AI workshop?' },
  ];

  const adminPrompts = [
    { label: 'Show participants', text: 'Show participants for the AI workshop.' },
    { label: 'Create event', text: 'Create an AI workshop on 25 October at 2 PM in Auditorium A with capacity 100.' },
    { label: 'Update event venue', text: 'Change the AI workshop venue to Seminar Hall 2.' },
    { label: 'Delete event', text: 'Delete the AI workshop.' },
    { label: 'Check registrations', text: 'How many students have registered for the AI workshop?' },
  ];

  const prompts = currentUser.role === 'admin' ? adminPrompts : studentPrompts;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto p-3 sm:p-4">
      {/* Session Header Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 sm:p-4 mb-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold text-slate-100 text-sm sm:text-base">
                  College Event Assistant
                </h2>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">Tools Connected</span>
              </div>
              <p className="text-xs text-slate-400">
                Live database synced • Google Calendar ready • Enforces capacity & duplicate rules
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-slate-400">Active session:</span>
            <span className="font-medium text-slate-200">{currentUser.data.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              currentUser.role === 'admin'
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              {currentUser.role === 'admin' ? currentUser.data.adminId : currentUser.data.studentId}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 bg-slate-900/70 border border-slate-800 rounded-2xl overflow-y-auto p-4 space-y-4 shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              Welcome, {currentUser.data.name}!
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">
              {currentUser.role === 'admin'
                ? 'Ask me to inspect participant lists, create new events, update venues, or check registration stats.'
                : 'I can help you search campus workshops, register for events, check your registrations, and sync with Google Calendar.'}
            </p>

            <div className="w-full max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Suggested Actions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {prompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(p.text)}
                    className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-xl transition-all group text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span>{p.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const hasToolCalls = msg.toolCalls && msg.toolCalls.length > 0;
            const messageToolId = `tools-${msg.id || index}`;
            const isExpanded = !!expandedTools[messageToolId];

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className={`flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-blue-400 border border-slate-700'
                  }`}>
                    {isUser ? (
                      currentUser.role === 'admin' ? 'AD' : 'ST'
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                    {/* Bubble */}
                    <div className="flex flex-col space-y-1.5">
                      {(() => {
                        const isError = !isUser && (
                          msg.content.toLowerCase().includes('error') || 
                          msg.content.toLowerCase().includes('duplicate') ||
                          msg.content.toLowerCase().includes('cannot register') ||
                          msg.content.toLowerCase().includes('already registered')
                        );

                        return (
                          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 rounded-tr-none'
                              : isError
                              ? 'bg-red-950/40 text-red-100 border border-red-500/40 shadow-md rounded-tl-none'
                              : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 shadow-md rounded-tl-none'
                          }`}>
                            {isError && (
                              <div className="flex items-center space-x-1.5 mb-1.5 text-red-400 text-xs font-bold uppercase tracking-wider">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Validation Notice</span>
                              </div>
                            )}
                            {msg.content}

                            {/* Google Calendar Link Button if present in tools */}
                            {!isUser && hasToolCalls && msg.toolCalls?.some((t) => t.tool === 'create_calendar_event' && t.result?.success) && (
                              <div className="mt-3 pt-3 border-t border-slate-700/80">
                                {(() => {
                                  const calCall = msg.toolCalls?.find((t) => t.tool === 'create_calendar_event' && t.result?.success);
                                  const link = calCall?.result?.calendarLink;
                                  if (!link) return null;
                                  return (
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/40 rounded-lg text-xs font-medium transition-colors"
                                    >
                                      <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                                      <span>Open in Google Calendar</span>
                                      <ExternalLink className="w-3 h-3 ml-0.5" />
                                    </a>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                    {/* Tool Calls Inspector Dropdown / Badge */}
                    {!isUser && hasToolCalls && (
                      <div className="text-xs">
                        <button
                          onClick={() => toggleToolExpand(messageToolId)}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <Wrench className="w-3 h-3 text-cyan-400" />
                          <span>
                            {msg.toolCalls?.length} backend tool{msg.toolCalls && msg.toolCalls.length > 1 ? 's' : ''} executed
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-2 max-w-lg">
                            {msg.toolCalls?.map((tc, tcIdx) => (
                              <div key={tcIdx} className="bg-slate-900/80 rounded-lg p-2 border border-slate-800/90">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono text-cyan-300 font-semibold text-[11px]">
                                    {tc.tool}()
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(tc.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="text-[11px] font-mono bg-slate-950 p-1.5 rounded text-slate-300 overflow-x-auto mb-1">
                                  <span className="text-slate-500">Args: </span>
                                  {JSON.stringify(tc.args)}
                                </div>
                                <div className="text-[11px] font-mono bg-slate-950 p-1.5 rounded text-slate-400 overflow-x-auto">
                                  <span className="text-slate-500">Result: </span>
                                  {JSON.stringify(tc.result)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-500 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-300 flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              </div>
              <span className="text-xs text-slate-400">Querying database & tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt quick suggestions bar */}
      <div className="my-2.5 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] text-slate-500 shrink-0 font-medium mr-1">Quick prompts:</span>
        {prompts.map((p, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSuggestionClick(p.text)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg text-xs whitespace-nowrap transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentUser.role === 'admin'
              ? 'Ask assistant (e.g. "Show participants for the AI workshop" or "Change venue to...")'
              : 'Ask assistant (e.g. "Register me for the AI workshop" or "Am I registered...")'
          }
          disabled={isLoading}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-4 pr-12 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-md disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
