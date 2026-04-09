import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      brand: "Island Arch Homestay",
      nav: {
        home: "Home",
        rooms: "Rooms",
        booking: "Booking",
        language: "中/EN"
      },
      hero: {
        title: "Island Arch Homestay",
        subtitle: "A pure white castle proudly standing between the blue sky and white clouds, decorated with Aegean Sea elements. Your perfect getaway in Penghu.",
        cta: "Book Your Stay"
      },
      about: {
        title: "About Us",
        desc1: "Are you ready for an island-hopping journey in Penghu's intoxicating seascape? Located in Magong City, Island Arch Homestay is here waiting for you.",
        desc2: "Our detached architecture offers convenient parking and walking. Enjoy our cozy lounge, dining area, a 3rd-floor pool table, and an exotic rooftop viewing area.",
      },
      rooms_section: {
        title: "Our Accommodations",
        subtitle: "Designed for your ultimate comfort with breathtaking views and complete amenities.",
        view_all: "View All Rooms",
        room_201: "201 Aegean Double Room",
        room_201_desc: "Cozy room with wooden decor, balcony, and clear outdoor breeze, perfect for 2 guests.",
        room_202: "202 Santorini Quad Room",
        room_202_desc: "Spacious refreshing room allowing you to fully relax and enjoy the island vibe for 4 guests.",
        room_203: "203 Ocean View Double Room",
        room_203_desc: "Bright room with large windows to experience the calm and purity of a holiday.",
        book_now: "Book Now"
      },
      booking: {
        title: "Reserve Your Holiday",
        check_in: "Check In",
        check_out: "Check Out",
        guests: "Guests",
        search: "Check Availability"
      },
      admin: {
        title: "Booking Management",
        subtitle: "Overview of all reservations and homestay operations.",
        guest_name: "Guest Name",
        room_type: "Room Type",
        dates: "Dates",
        status: "Status",
        actions: "Actions",
        status_pending: "Pending",
        status_confirmed: "Confirmed",
        status_cancelled: "Cancelled",
        action_approve: "Approve",
        action_cancel: "Cancel"
      },
      footer: {
        services_title: "Our Services",
        services: "Penghu Tickets • Tour Packages • Fireworks Fest Info • Parking • WiFi",
        rights: "© 2026 Island Arch Homestay. All rights reserved.",
        address: "NO. 232-56, Xiwei, Magong City, Penghu County",
        contact: "Contact us: 06-9268238 | 091 8-510119"
      }
    }
  },
  zh: {
    translation: {
      brand: "海島拱門民宿",
      nav: {
        home: "首頁",
        rooms: "客房介紹",
        booking: "立即預約",
        admin: "管理後台",
        language: "中/EN"
      },
      hero: {
        title: "澎湖民宿‧海島拱門民宿",
        subtitle: "純白的城堡風格傲然挺立於藍天白雲之間，以愛琴海元素妝點清新浪漫，為您打造一個終身難忘的假期。",
        cta: "預約您的假期"
      },
      about: {
        title: "關於我們",
        desc1: "澎湖那令人沉醉飛揚的海景，您是否想來場跳島旅行？不用猶豫，位於馬公市西衛里的《澎湖民宿‧海島拱門民宿》就在這裡等著您。",
        desc2: "獨棟的規劃讓旅人停車散步皆便利，內備有交誼廳、三樓撞球桌以及頂樓異國風情觀景區。便捷的地理位置，鄰近第三漁港與花火節主場！",
      },
      rooms_section: {
        title: "客房介紹",
        subtitle: "絕美的拱門設計，木質家居飾品與裝潢讓空間散發著無憂氣息",
        view_all: "查看所有房型",
        room_201: "201 無憂海風雙人房",
        room_201_desc: "設有獨立陽台可接引戶外氣息，讓您在海島每刻都能舒心浪漫。",
        room_202: "202 愛琴海浪漫四人房",
        room_202_desc: "融合愛琴海元素，空間清新舒適，為您備齊所有度假所需的用品。",
        room_203: "203 蔚藍海景雙人房",
        room_203_desc: "大面窗戶引進純淨陽光，體驗度假的寧靜與純粹。",
        book_now: "立即預訂"
      },
      booking: {
        title: "預留您的專屬天堂",
        check_in: "入住日期",
        check_out: "退房日期",
        guests: "入住人數",
        search: "查詢空房"
      },
      admin: {
        title: "預約管理後台",
        subtitle: "檢視所有訂單與民宿管理操作",
        guest_name: "住客姓名",
        room_type: "預訂房型",
        dates: "入住/退房日期",
        status: "訂單狀態",
        actions: "管理操作",
        status_pending: "待確認",
        status_confirmed: "已確認",
        status_cancelled: "已取消",
        action_approve: "核准",
        action_cancel: "取消訂單"
      },
      footer: {
        services_title: "服務項目",
        services: "澎湖套裝行程 • 花火節資訊 • 停車場 • 無線上網 • 露天休閒區",
        rights: "© 2026 海島拱門民宿 Island Arch Homestay. 版權所有。",
        address: "澎湖縣馬公市西衛里232-56號",
        contact: "聯絡我們: 06-9268238 | 0918-510119"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh", // Default language is Traditional Chinese
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
