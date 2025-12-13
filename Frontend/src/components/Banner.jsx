function Banner() {
  return (
    <div className="bg-[url('\project_images/beautybanner.jpg')] bg-no-repeat bg-cover h-[80vh]">
      <div className="flex flex-col gap-5 px-[10%] py-[20%]">
        <span className="text-2xl">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vitae dolore
          ea iste eligendi
        </span>
        <h1 className="text-2xl text-gray-700 font-semibold">Lorem ipsum dolor sit amet consectetur,</h1>
        <div className="flex gap-7">
          <button className="border-2 border-blue-500 border-solid w-[200px] p-1 rounded-lg bg-[#69acd9] text-white"> Shop Now</button>
          <button className="w-[200px]  p-1 rounded-lg bg-[#5f62647a] ">Call +251 991515588</button>
        </div>
      </div>
    </div>
  );
}

export default Banner;
