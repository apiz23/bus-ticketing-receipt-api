"use client";

import supabase from "@/lib/supabaseCon";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bus, MapPin, Phone, UserRound } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface BusModel {
	brand: string;
	type: string;
}

interface BusRoute {
	from_station: string;
	to_station: string;
	date: string | null;
	time: string;
	price: number;
}

interface Booking {
	book_id: string;
	name: string;
	seat_no: string;
	email: string;
	no_phone: string;
	bus_route: BusRoute;
	bus_model: BusModel;
}

export default function Page() {
	const params = useParams();
	const [busBooking, setBusBooking] = useState<Booking[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const { data, error } = await supabase
				.from("bus_booking")
				.select(
					`
            *,
            bus_route (*),
            bus_model:bus_id (*)
        `
				)
				.eq("book_id", params.id);

			if (error) {
				setError(error.message);
			} else {
				setBusBooking(data || []);
			}
		};

		if (params.id) {
			fetchData();
		}
	}, [params.id]);

	if (error) {
		return <p>Error: {error}</p>;
	}

	if (!busBooking.length) {
		return <p>Loading...</p>;
	}

	const handleDownloadPDF = async () => {
		const element = document.getElementById("content-to-print");

		if (!element) {
			console.error("Element with id 'content-to-print' not found.");
			return;
		}

		const canvas = await html2canvas(element, {
			scale: 2,
			useCORS: true,
		});
		const imgData = canvas.toDataURL("image/png");

		const pdf = new jsPDF({
			orientation: "p",
			unit: "mm",
			format: "a4",
		});

		pdf.addImage(imgData, "PNG", 10, 10, 190, 270);

		const filename = prompt("Enter the filename for the PDF:", "download.pdf");

		if (filename) {
			pdf.save(filename);
		} else {
			console.log("Download cancelled");
		}
	};

	return (
		<div className="min-h-screen bg-black text-white py-5 sm:py-10">
			<h1 className="text-3xl sm:text-5xl text-center mb-5 uppercase sm:mb-10">
				Bus Booking Details
			</h1>
			<div className="m-3">
				{busBooking.map((booking, index) => (
					<Card
						key={index}
						className="mx-auto w-full sm:w-[210mm] h-auto sm:h-[297mm] p-4 sm:p-6 shadow-none border-none rounded-md bg-white text-black"
						id="content-to-print"
					>
						<CardHeader>
							<CardTitle className="text-4xl capitalize">receipts</CardTitle>
							<CardDescription className="text-md sm:text-sm">
								Booking References: {booking.book_id}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="font-bold text-lg sm:text-3xl">
								{booking.bus_route.from_station} {">"} {booking.bus_route.to_station}
							</p>
							<span className="text-xs sm:text-sm">
								{booking.bus_route.date
									? new Date(booking.bus_route.date).toLocaleDateString("en-US", {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
									  })
									: "Date not available"}
								, {booking.bus_route.time}
							</span>
							<div className="my-8 sm:my-12">
								<h1 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-5 flex gap-3 sm:gap-4">
									<Bus size={28} /> Trip Details
								</h1>
								<dl className="-my-3 divide-y divide-gray-100 text-xs sm:text-sm">
									<div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4 text-base">
										<dt className="font-medium text-gray-900">Company</dt>
										<dd className="text-gray-700 sm:col-span-2 text-md">
											{booking.bus_model.brand} - {booking.bus_model.type}
										</dd>
									</div>
									<div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4 text-base">
										<dt className="font-medium text-gray-900">Departure Time</dt>
										<dd className="text-gray-700 sm:col-span-2 text-md">
											{booking.bus_route.time}
										</dd>
									</div>
								</dl>
							</div>
							<div className="my-8 sm:my-12">
								<h1 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-5 flex gap-3 sm:gap-4">
									<MapPin size={28} />
									Boarding/Drop Points
								</h1>
								<dl className="-my-3 divide-y divide-gray-100 text-xs sm:text-sm">
									<div className="grid grid-cols-2 gap-1 py-3 sm:grid-cols-3 sm:gap-4 text-base">
										<dt className="font-medium text-gray-900">
											<span className="">Boarding Point</span>
										</dt>
										<dd className="text-gray-900 sm:col-span-2 text-md">
											<dt className="font-medium text-gray-900">
												{booking.bus_route.from_station}
											</dt>
										</dd>
									</div>
									<div className="grid grid-cols-2 gap-1 py-3 sm:grid-cols-3 sm:gap-4 text-base">
										<dt className="font-medium text-gray-900">
											<span className="">Drop Point</span>
										</dt>
										<dd className="text-gray-900 sm:col-span-2 text-md">
											<dt className="font-medium text-gray-900">
												{booking.bus_route.to_station}
											</dt>
										</dd>
									</div>
								</dl>
							</div>
							<div className="my-8 sm:my-12">
								<h1 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-5 flex gap-3 sm:gap-4">
									<UserRound size={28} />
									Traveller Details
								</h1>
								<dl className="-my-3 divide-y divide-gray-100 text-xs sm:text-sm">
									<div className="grid grid-cols-3 gap-1 py-3 sm:gap-4 text-base">
										<dt className="font-medium text-gray-900">{booking.name}</dt>
										<dd className="text-gray-700 sm:col-span-2 text-md">
											Seat No:{" "}
											<span className="font-semibold text-black">{booking.seat_no}</span>
										</dd>
									</div>
								</dl>
							</div>
							<div className="my-8 sm:my-12">
								<h1 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-5 flex gap-3 sm:gap-4">
									<Phone size={28} />
									Contact Details
								</h1>
								<dl className="-my-3 text-xs sm:text-sm">
									<div className="grid grid-cols-2 gap-1 py-3 sm:gap-4 text-base">
										<div className="col-span-1">
											<dt className="font-medium text-gray-900">Email: {booking.email}</dt>
										</div>
										<div className="col-span-1">
											<dt className="font-medium text-gray-900">
												Mobile: {booking.no_phone}
											</dt>
										</div>
									</div>
									<div className="grid grid-cols-1 gap-1 py-3 sm:gap-4 text-base">
										<div className="col-span-1">
											<dt className="font-medium text-lg text-gray-900">
												Price:
												<span className="font-bold ms-3">
													MYR {booking.bus_route.price}
												</span>
											</dt>
										</div>
									</div>
								</dl>
							</div>
						</CardContent>
						<CardFooter>
							<div className="mt-8 border-t pt-4 text-gray-700 text-sm">
								<p className="font-semibold text-black">Important Information</p>
								<ul className="list-inside list-disc text-justify">
									<li>
										Stated arrival time is estimation only, the exact arrival time will
										depend on the traffic condition and other external factors.
									</li>
									<li>
										You will receive your boarding pass on email at least 2 hours before
										the departure time.
									</li>
								</ul>
							</div>
						</CardFooter>
					</Card>
				))}
				<div className="max-w-3xl mx-auto flex justify-end">
					<Button
						className="my-5 inline-block rounded hover:bg-red-600 bg-red-500 px-8 py-2 text-sm font-medium text-white transition hover:scale-110 active:bg-red-900"
						onClick={handleDownloadPDF}
					>
						Generate PDF
					</Button>
				</div>
			</div>
		</div>
	);
}
