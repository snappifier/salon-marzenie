export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-dvh w-dvw flex items-center justify-center bg-gray-100">
			<div className="bg-white rounded-lg shadow-md w-full overflow-hidden">
				{children}
			</div>
		</div>
	);
}