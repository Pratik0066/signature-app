export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between">
        <p className="text-zinc-500">
          © 2026 SignFlow
        </p>

        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
        </div>
      </div>
    </footer>
  );
}