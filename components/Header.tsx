export default function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
      <div className="max-w-md mx-auto flex items-center gap-2">
        <span className="text-xl">🍽️</span>
        <h1 className="text-lg font-bold text-foreground">
          윤주의 냉장고를 부탁해
        </h1>
      </div>
    </header>
  );
}
