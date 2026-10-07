import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { CulinaryEvent } from '../../types';
import { Calendar, MapPin, Users, Ticket, Sparkles, Clock, ArrowRight } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<CulinaryEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadEvents() {
      const data = await eventService.getEvents();
      setEvents(data);
      setIsLoading(false);
    }
    loadEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-indigo-950 to-stone-900 p-8 sm:p-12 text-white shadow-xl mb-12">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusive Gastronomic Experiences</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Culinary Events & Masterclasses
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Reserve your seat at private degustation dinners, live heritage music nights, artisanal sourdough workshops, and masterclasses hosted by premier Indian chefs.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => {
          const remainingTickets = event.totalCapacity - event.bookedCount;
          const isFillingFast = remainingTickets <= 10;

          return (
            <div
              key={event._id}
              className="flex flex-col justify-between bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative h-56 overflow-hidden bg-stone-100">
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex items-center space-x-1 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-xs text-white text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                  <span>{new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
                {isFillingFast && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold animate-pulse">
                    Only {remainingTickets} Left!
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-stone-500 mb-2">
                    <span className="text-indigo-600 font-bold">{event.cuisine}</span>
                    <span>•</span>
                    <span className="truncate">{event.restaurantName}</span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-indigo-600 transition-colors leading-snug mb-2">
                    {event.title}
                  </h3>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 mb-4">
                    {event.description}
                  </p>

                  <div className="space-y-1 text-xs text-stone-500 mb-4 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 text-stone-400 mr-2" />
                      <span>{event.timeSlot}</span>
                    </div>
                    {event.chefName && (
                      <div className="flex items-center">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-2" />
                        <span>Hosted by: <strong className="text-stone-800">{event.chefName}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Ticket Pass</span>
                    <span className="text-xl font-extrabold text-stone-900">₹{event.ticketPrice}</span>
                  </div>

                  <Link
                    to={`/event/${event._id}`}
                    className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>View & Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
