function Category() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 px-2 md:px-6 lg:px-12 my-10">

      <div className="bg-[url('/project_images/serum1.jpg')] bg-no-repeat bg-cover h-[400px] md:h-[500px] w-full flex items-center justify-center rounded-xl overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-l from-black/50 to-transparent">
          <h1 className="text-2xl md:text-4xl text-white font-semibold">Toners</h1>
        </div>
      </div>

      <div className="bg-[url('/project_images/lotion.jpg')] bg-no-repeat bg-cover h-[400px] md:h-[500px] w-full flex items-center justify-center rounded-xl overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-l from-black/50 to-transparent">
          <h1 className="text-2xl md:text-4xl text-white font-semibold">Lotions</h1>
        </div>
      </div>

      <div className="bg-[url('/project_images/serum.jpg')] bg-no-repeat bg-cover h-[400px] md:h-[500px] w-full flex items-center justify-center rounded-xl overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-l from-black/50 to-transparent">
          <h1 className="text-2xl md:text-4xl text-white font-semibold">Serums</h1>
        </div>
      </div>

      <div className="bg-[url('/project_images/foundation.jpg')] bg-no-repeat bg-cover h-[400px] md:h-[500px] w-full flex items-center justify-center rounded-xl overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-l from-black/50 to-transparent">
          <h1 className="text-2xl md:text-4xl text-white font-semibold">Foundation</h1>
        </div>
      </div>

    </div>
  );
}

export default Category;
