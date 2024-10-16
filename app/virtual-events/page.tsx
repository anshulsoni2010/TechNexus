"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FooterSection } from '@/components/layout/sections/footer';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'; // Importing icons from lucide-react

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isMobile;
};

const EventsPage = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 8; // Number of events to display per page
    const isMobile = useIsMobile();
    const [favourites, setFavourites] = useState<any[]>([]);

    useEffect(() => {
        const fetchEvents = async () => {
            const response = await fetch('/data/virtual-events.json');
            if (!response.ok) {
                console.error('Failed to fetch events:', response.statusText);
                return;
            }
            const data = await response.json();
            setEvents(data.events);
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        const storedFavourites = JSON.parse(localStorage.getItem('favourites') || '[]');
        setFavourites(storedFavourites);
    }, []);

    const toggleFavourite = (event: any) => {
        if (!event) return; // Defensive check for event
        const eventType = 'virtual'; // Specify the event type
        const updatedFavourites = favourites.some(fav => fav.event?.id === event.id && fav.type === eventType)
            ? favourites.filter(fav => !(fav.event?.id === event.id && fav.type === eventType))
            : [...favourites, { type: eventType, event }];

        setFavourites(updatedFavourites);
        localStorage.setItem('favourites', JSON.stringify(updatedFavourites));
    };

    const parseDate = (dateString: string) => {
        const [day, month, year] = dateString.split(':').map(Number);
        return new Date(year, month - 1, day);
    };

    const filteredEvents = events.filter(event => {
        const matchesName = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBadge = event.badge?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesLink = event.link?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesDescription = event.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesLocation = event.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesStartDate = startDate ? parseDate(event.date) >= startDate : true;
        const matchesEndDate = endDate ? parseDate(event.date) <= endDate : true;
        return (matchesName || matchesBadge || matchesLink || matchesDescription || matchesLocation) && matchesStartDate && matchesEndDate;
    });

    // Calculate the current events to display
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

    // Calculate total pages
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

    return (
        <section className="events  min-h-screen flex flex-col items-center">
            <div className="px-4 py-8 w-full max-w-4xl">
                <h2 className="text-3xl font-bold md:text-4xl text-center mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-indigo-400 to-indigo-800">
                    Virtual Events
                </h2>
                <p className="text-base md:text-lg text-center text-slate-100 mb-4">
                    Our Exciting Lineup of Live Sessions, Hackathons, Bootcamps, and More!
                </p>

                {/* Search Bar */}
                <div className="flex flex-col md:flex-row justify-center mb-6">
                    <input
                        type="text"
                        placeholder="Search by event name"
                        className="border rounded-md p-2 mr-2 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd:MM:yyyy"
                        placeholderText="Start Date (dd:mm:yyyy)"
                        className="border rounded-md p-2 mr-2 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd:MM:yyyy"
                        placeholderText="End Date (dd:mm:yyyy)"
                        className="border rounded-md p-2 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className='flex flex-col items-center'>
                    {currentEvents.map((event) => (
                        <div key={event.id} className={`my-6 relative max-w-[900px] py-8 sm:py-6 sm:pt-14 md:py-10 lg:py-10 px-4 md:px-[75px] w-full happening-card border border-[#323232]/50 bg-opacity-20 [border:1px_solid_rgba(255,255,255,.1)] [box-shadow:0_-20px_80px_-20px_#8686f01f_inset] p-6 shadow-xl backdrop-blur-8xl rounded-lg text-white overflow-hidden transition-transform duration-300 transform ${isMobile ? '' : 'hover:scale-105'}`}>
                            {/* Badge for large screens (laptop and desktop) */}
                            <div className="hidden md:block absolute top-0 justify-center text-white px-2 py-1 border-2 border-t-0 border-[#131215] bg-[#06040c]/50 text-[#e1e1e4]/70 rounded-sm pt-3 mt-[-4px]">{event.badge}</div>
                            {/* Badge for mobile devices */}
                            <div className="block md:hidden absolute bottom-0 justify-center px-2 py-1 border-2 border-b-0 border-[#131215] bg-[#06040c]/50 text-[#e1e1e4]/80 rounded-sm pb-3 mb-[-4px]">{event.title}</div>
                            <div className="flex flex-col-reverse md:flex-row relative justify-between items-center gap-8">
                                <div className="w-full md:w-2/3 flex flex-col">
                                    <div className="text-4xl text-slate-100 font-semibold leading-tight">{event.title}</div>
                                    <div className="pt-3 text-base text-zinc-200 opacity-90">
                                        {event.description.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}
                                    </div>
                                    <div className="py-4 grid grid-cols-2 gap-5">
                                        <div className="flex flex-col">
                                            <div className="font-semi-bold text-xs md:text-base">Date</div>
                                            <div className="font-medium text-xs md:text-base">{event.date}</div>
                                        </div>

                                        <div className="">
                                            <Link href={event.link} passHref>
                                                <button className="group relative m-1 inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-gray-700 bg-gradient-to-tr from-[#12111d] to-primary-blue/50 px-4 py-1 text-xs md:text-base text-white shadow-lg transition duration-300 ease-in-out transform hover:scale-105 active:translate-y-0.5 active:border-gray-800 active:shadow-none">
                                                    <span className="absolute h-0 w-0 rounded-full bg-white opacity-10 transition-all duration-300 ease-out group-hover:h-36 group-hover:w-36"></span>
                                                    <span className="relative font-medium">Register Now</span>
                                                </button>
                                            </Link>
                                            <button onClick={() => toggleFavourite(event)} className="mt-4">
                                                <Heart className={`w-6 h-6 ${favourites.some(fav => fav.event?.id === event.id && fav.type === 'virtual') ? 'text-red-500' : 'text-gray-500'}`} />
                                                </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center w-full md:w-1/3">
                                    <div className="w-250 h-250 rounded-2xl border-1 border-[#363A42]">
                                        <Image
                                            src={event.image}
                                            alt={event.title}
                                            width={250}
                                            height={250}
                                            className="HappeningIMG rounded-2xl transition-transform duration-300 transform hover:scale-105"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center mt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 mx-2 rounded flex items-center ${currentPage === 1 ? 'bg-gray-600 opacity-50' : 'bg-[#152238] text-white'}`}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="mx-2">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 mx-2 rounded flex items-center ${currentPage === totalPages ? 'bg-gray-600 opacity-50' : 'bg-[#152238] text-white'}`}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
            <FooterSection />
        </section>
    );
};

export default EventsPage;
