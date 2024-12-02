import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";

const inter = Poppins({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
	title: "Bus Receipts",
	description: "Fetch Data for Receipt API",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased`}>{children}</body>
		</html>
	);
}
