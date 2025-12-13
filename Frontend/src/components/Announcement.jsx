import Typewriter from "typewriter-effect";

function Announcement() {
  return (
    <div className="flex items-center justify-center bg-[#69acd9] text-2xl text-white h-10">
      <Typewriter
        onInit={(typewriter) => {
          typewriter
            .typeString("Beauty")
            .pauseFor(1000)
            .deleteAll(50)       // delete speed in ms
            .typeString("Discount")
            .pauseFor(1000)
            .deleteAll(50)
            .start();
        }}
        options={{
          autoStart: true,
          loop: true,
          cursor: "_",           // custom cursor
        }}
      />
    </div>
  );
}

export default Announcement;
