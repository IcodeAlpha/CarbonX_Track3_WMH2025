"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";

export default function ImageSlider({ images, height }) {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade" // enable fade effect
        fadeEffect={{ crossFade: true }} // smooth crossfade
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        spaceBetween={20}
        slidesPerView={1}
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <img
              src={src}
              alt={`Slide ${i}`}
              className="w-full h-64 object-cover"
              style={{ height: `${height}px` }} 
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
