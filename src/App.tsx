import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as xlsx from 'xlsx';
import { Gem, ArrowRight, ShieldCheck, MapPin, Factory, TrendingUp, MessageCircle, PhoneCall, Calculator, DollarSign, CalendarClock, Percent, Wallet, PiggyBank, Play, Pause, DownloadCloud, User, Send } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'motion/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function App() {
  const images = [
    "https://i.postimg.cc/kXfHBsWj/TIN-TUC-DU-AN-BAT-DONG-SAN-DUAN-20-04-2026.png",
    "https://i.postimg.cc/wx5Zdgvf/gen-n-VI-TRI-CA-C-LO.jpg",
    "https://i.postimg.cc/Pfb9kTJT/gen-n-z7741852308051-8228db1de668f4d17b18076afa2adc28.jpg",
    "https://i.postimg.cc/dVQKfDjn/gen-h-z7741239072488-e314805a315608f5490c4fdbc846b535.jpg",
    "https://i.postimg.cc/fysP0gHx/gen-h-z7743311946089-291b5b445742fbdb4f3bbb395f54b20f.jpg",
    "https://i.postimg.cc/595TMbyM/gen-h-z7744531336554-50a8e46da7a0894ff97e546d6ac54f6b.jpg"
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [isScrolled, setIsScrolled] = useState(false);

  // Audio State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Loan Calculator State (V2)
  const [propertyPrice, setPropertyPrice] = useState(525000000);
  const [ownCapital, setOwnCapital] = useState(105000000);
  const [loanTermYears, setLoanTermYears] = useState(15);
  const [interestRateAnnual, setInterestRateAnnual] = useState(8.5);
  const [paymentMethod, setPaymentMethod] = useState<'decreasing' | 'annuity'>('decreasing');

  const { loanAmount, firstMonthPayment, totalInterest, principalPerMonth, firstMonthInterest } = useMemo(() => {
    const loanAmt = Math.max(0, propertyPrice - ownCapital);
    const monthlyRate = interestRateAnnual / 100 / 12;
    const totalMonths = loanTermYears * 12;

    let firstMonthTot = 0;
    let totalInt = 0;
    let principalPM = 0;
    let firstMonthInt = 0;

    if (paymentMethod === 'decreasing') {
      principalPM = totalMonths > 0 ? loanAmt / totalMonths : 0;
      firstMonthInt = loanAmt * monthlyRate;
      firstMonthTot = principalPM + firstMonthInt;
      totalInt = (loanAmt * monthlyRate) * (totalMonths + 1) / 2;
    } else {
      // Annuity
      if (monthlyRate > 0 && totalMonths > 0) {
        firstMonthTot = loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        totalInt = (firstMonthTot * totalMonths) - loanAmt;
        firstMonthInt = loanAmt * monthlyRate;
        principalPM = firstMonthTot - firstMonthInt;
      } else if (totalMonths > 0) {
        firstMonthTot = loanAmt / totalMonths;
        totalInt = 0;
        principalPM = firstMonthTot;
      }
    }

    return {
      loanAmount: loanAmt,
      firstMonthPayment: firstMonthTot,
      totalInterest: totalInt,
      principalPerMonth: principalPM,
      firstMonthInterest: firstMonthInt
    };
  }, [propertyPrice, ownCapital, loanTermYears, interestRateAnnual, paymentMethod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const exportCSV = () => {
    const totalMonths = loanTermYears * 12;
    const monthlyRate = interestRateAnnual / 100 / 12;
    let remainingLoan = loanAmount;
    
    const aoa: any[][] = [];
    
    // Header section
    aoa.push(["BẢNG TÍNH LỘ TRÌNH THANH TOÁN", "", "", "", ""]); // Row 1
    aoa.push(["", "", "", "", ""]); // Row 2
    aoa.push(["I. THÔNG TIN ĐẦU VÀO (Có thể thay đổi để tính tự động)", "", "", "", ""]); // Row 3
    aoa.push(["Tên dự án:", "Tân Quan - Đồng Nai", "", "", ""]); // Row 4
    aoa.push(["Giá trị tài sản (VNĐ):", { t: 'n', v: propertyPrice }, "", "", ""]); // Row 5
    aoa.push(["Vốn tự có (VNĐ):", { t: 'n', v: ownCapital, f: "B5-B7" }, "", "", ""]); // Row 6
    aoa.push(["Vốn vay (VNĐ):", { t: 'n', v: loanAmount }, "", "", ""]); // Row 7
    aoa.push(["Lãi suất (%/năm):", { t: 'n', v: interestRateAnnual }, "", "", ""]); // Row 8
    aoa.push(["Thời gian vay (năm):", { t: 'n', v: loanTermYears }, "", "", ""]); // Row 9
    aoa.push(["Phương thức trả:", paymentMethod === 'decreasing' ? 'Dư nợ giảm dần' : 'Dư nợ ban đầu (Đều hàng tháng)', "", "", ""]); // Row 10
    aoa.push(["", "", "", "", ""]); // Row 11
    aoa.push(["II. LỘ TRÌNH THANH TOÁN CHI TIẾT", "", "", "", ""]); // Row 12
    aoa.push(["Kỳ trả nợ", "Dư nợ đầu kỳ (VNĐ)", "Gốc phải trả (VNĐ)", "Lãi phải trả (VNĐ)", "Tổng tiền phải trả (VNĐ)"]); // Row 13
    
    // Table rows
    const startRow = 14;
    for (let i = 1; i <= totalMonths; i++) {
        const r = startRow + i - 1; // 1-indexed row number in EXCEL

        let b_val = remainingLoan; // initial value for B
        let b_form = i === 1 ? `B7` : `B${r-1}-C${r-1}`;
        
        let c_val, c_form, d_val, d_form, e_val, e_form;
        
        if (paymentMethod === 'decreasing') {
            const principalPM = loanAmount / totalMonths;
            const interestPM = remainingLoan * monthlyRate;
            const totalPM = principalPM + interestPM;
            
            c_val = principalPM;
            c_form = `B$7/(B$9*12)`;
            
            d_val = interestPM;
            d_form = `B${r}*(B$8/100/12)`;
            
            e_val = totalPM;
            e_form = `C${r}+D${r}`;
            
            remainingLoan -= principalPM;
        } else {
            const monthlyPmt = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
            const interestPM = remainingLoan * monthlyRate;
            const principalPM = monthlyPmt - interestPM;
            
            c_val = principalPM;
            c_form = `E${r}-D${r}`;
            
            d_val = interestPM;
            d_form = `B${r}*(B$8/100/12)`;
            
            e_val = monthlyPmt;
            e_form = `PMT(B$8/100/12,B$9*12,-B$7)`;
            
            remainingLoan -= principalPM;
        }

        aoa.push([
            { t: 'n', v: i }, // A: Kỳ trả nợ
            { t: 'n', v: Math.round(b_val), f: b_form }, // B: Dư nợ đầu kỳ
            { t: 'n', v: Math.round(c_val), f: c_form }, // C: Gốc
            { t: 'n', v: Math.round(d_val), f: d_form }, // D: Lãi
            { t: 'n', v: Math.round(e_val), f: e_form }  // E: Tổng
        ]);
    }
    
    const worksheet = xlsx.utils.aoa_to_sheet(aoa);
    
    // Apply number format to values
    const numFmt = '#,##0';
    // Format input cells
    ['B5', 'B6', 'B7'].forEach(cell => {
        if (worksheet[cell]) worksheet[cell].z = numFmt;
    });
    
    // Format table cells
    for (let r = startRow; r < startRow + totalMonths; r++) {
        ['B', 'C', 'D', 'E'].forEach(col => {
            const cell = col + r;
            if (worksheet[cell]) {
                worksheet[cell].z = numFmt;
            }
        });
    }
    
    // Set column widths to perfectly fit A4 width
    // Total approx acceptable for portrait A4 in Excel is ~88 standard chars wide
    const wscols = [
        {wch: 12}, // A: Kỳ trả nợ
        {wch: 22}, // B: Dư nợ đầu kỳ
        {wch: 22}, // C: Gốc phải trả
        {wch: 22}, // D: Lãi phải trả
        {wch: 24}  // E: Tổng tiền phải trả
    ];
    worksheet['!cols'] = wscols;

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Lộ trình thanh toán");
    
    xlsx.writeFile(workbook, "lo-trinh-thanh-toan.xlsx");
  };

  useEffect(() => {
    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScrollEvent);
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);

  return (
    <div className="bg-gray-50 text-slate-900 font-sans min-h-screen">
      
      {/* Navbar Minimal/Glass */}
      <nav className={`fixed w-full z-[100] transition-all duration-300 ${isScrolled ? 'glass bg-white/90 shadow-sm py-0' : 'bg-transparent py-2'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <img src="https://i.postimg.cc/yd78BR2C/gen-n-z7176066495139-85960b0aac82e747ab4f71a74cde2153.jpg" alt="Thanh Nghiêm" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-red-700 p-[2px] shadow-sm" />
                <div className="flex flex-col">
                    <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 uppercase leading-none mb-1">THANH NGHIÊM <span className="text-red-700">BĐS</span></span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block leading-none">Trao giá trị thực - Vững niềm tin vàng</span>
                </div>
            </div>
            <div className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase text-slate-600">
                <a href="#about" onClick={(e) => handleScroll(e, 'about')} className="hover:text-red-700 transition">Tổng quan</a>
                <a href="#gallery" onClick={(e) => handleScroll(e, 'gallery')} className="hover:text-red-700 transition">Thư viện</a>
                <a href="#calculator" onClick={(e) => handleScroll(e, 'calculator')} className="hover:text-red-700 transition">Tính lãi vay</a>
                <a href="#contact" onClick={(e) => handleScroll(e, 'contact')} className="bg-red-700 text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-red-900/20 transition hover:-translate-y-0.5">Nhận ưu đãi 1 chỉ vàng</a>
            </div>
        </div>
      </nav>

      {/* Hero Overlap Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-slate-50 hidden lg:block -skew-x-12 translate-x-20 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full pt-10">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="flex items-center gap-3 mb-6 bg-white/60 backdrop-blur-md p-2 pr-6 border border-slate-200 rounded-full inline-flex shadow-sm">
                   <img src="https://i.postimg.cc/yd78BR2C/gen-n-z7176066495139-85960b0aac82e747ab4f71a74cde2153.jpg" alt="Thanh Nghiêm" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                   <div>
                      <p className="text-sm font-black text-slate-900 uppercase">THANH NGHIÊM</p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Hỗ trợ pháp lý & Tư vấn đầu tư</p>
                   </div>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                    Đất Nền <br className="hidden lg:block"/><span className="text-red-700 tracking-tighter">Sổ Hồng Riêng</span> <br/>Tại Tân Quan
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
                    Sở hữu ngay lô đất <strong className="text-slate-900 font-bold">180m²</strong> chỉ với <strong className="text-red-700 font-black text-2xl tracking-tighter">525 Triệu</strong>. Vị trí vàng sát KCN, hạ tầng hoàn thiện 100%.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <a href="#contact" onClick={(e) => handleScroll(e, 'contact')} className="px-8 py-5 bg-red-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-red-800 transition shadow-xl shadow-red-900/30 hover:-translate-y-1 group">
                        ĐẶT CỌC NHẬN VÀNG <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
                <div className="mt-8 flex items-center gap-3 text-slate-500 font-medium bg-slate-50 inline-flex px-4 py-2 rounded-lg border border-slate-100">
                    <ShieldCheck className="text-green-600 w-5 h-5" /> <span>Ngân hàng hỗ trợ vay 80% lãi suất ưu đãi</span>
                </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
                <div className="absolute -inset-4 bg-red-700/10 rounded-3xl -rotate-3 transform-gpu"></div>
                <img src="https://i.postimg.cc/wx5Zdgvf/gen-n-VI-TRI-CA-C-LO.jpg" className="relative rounded-3xl shadow-2xl border-4 border-white object-cover aspect-[4/3] w-full" alt="Vị trí dự án Tân Quan" loading="lazy" />
            </motion.div>
        </div>
      </section>

      {/* Premium Gallery Section */}
      <section id="gallery" className="py-24 bg-slate-900 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black z-0"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
               className="text-center mb-16"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
            >
                <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">Thực Tế Dự Án & <span className="text-red-500">Pháp Lý</span></h2>
                <div className="w-20 h-1.5 rounded-full bg-red-600 mx-auto"></div>
            </motion.div>
            
            <motion.div 
               className="rounded-3xl overflow-hidden shadow-2xl shadow-black border border-slate-700/50 bg-slate-800/50 backdrop-blur p-2"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, delay: 0.2 }}
            >
                <Swiper 
                    modules={[Autoplay, Navigation, Pagination, EffectFade]}
                    effect="fade"
                    loop={true}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation={true}
                    className="w-full aspect-[4/3] md:aspect-video rounded-2xl overflow-hidden bg-white/5"
                >
                    {images.map((src, index) => (
                        <SwiperSlide key={index}>
                           <img src={src} className={`${index === 0 ? 'object-contain bg-white/10' : 'object-cover'} w-full h-full`} alt={`Thực tế dự án ${index + 1}`} loading="lazy" />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </motion.div>
        </div>
      </section>

      {/* Feature Value Block */}
      <section className="py-24 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Giá Trị Cốt Lõi</h2>
              <div className="w-20 h-1.5 rounded-full bg-red-600 mx-auto"></div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
                <motion.div 
                   className="p-10 rounded-3xl bg-gray-50/80 border border-gray-100 group hover:bg-red-700 hover:text-white transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-red-900/20"
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5 }}
                >
                    <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <MapPin strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Vị trí Kim Cương</h3>
                    <p className="opacity-70 text-lg leading-relaxed group-hover:opacity-90">Cách trục chính DT756B chỉ 50m. Mặt tiền đường bê tông rộng rãi, thông thoáng.</p>
                </motion.div>
                
                <motion.div 
                   className="p-10 rounded-3xl bg-gray-50/80 border border-gray-100 group hover:bg-red-700 hover:text-white transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-red-900/20"
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <Factory strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Đón Đầu Công Nghiệp</h3>
                    <p className="opacity-70 text-lg leading-relaxed group-hover:opacity-90">Liền kề các xưởng sản xuất lớn và các cụm khu công nghiệp đang hình thành.</p>
                </motion.div>
                
                <motion.div 
                   className="p-10 rounded-3xl bg-gray-50/80 border border-gray-100 group hover:bg-red-700 hover:text-white transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-red-900/20"
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <TrendingUp strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Lợi Nhuận Tức Thì</h3>
                    <p className="opacity-70 text-lg leading-relaxed group-hover:opacity-90">Sổ sẵn sang tên ngay. Tặng <strong className="font-bold">1 chỉ vàng SJC</strong> cho khách hàng chốt cọc sớm.</p>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Loan Calculator Section */}
      <section id="calculator" className="py-24 bg-red-50 border-y border-red-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-red-900">
           <Calculator size={300} />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
               className="text-center mb-16"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                     <Calculator size={16} /> Công cụ tính toán
                </div>
                <h2 className="text-4xl lg:text-5xl font-black mb-6 text-slate-900 tracking-tight">Dự Toán <span className="text-red-700">Lãi Suất Vay</span></h2>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">Tham khảo mức chi trả hàng tháng theo dư nợ giảm dần để có kế hoạch tài chính phù hợp nhất.</p>
            </motion.div>
            
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Inputs */}
                <motion.div 
                  className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="font-bold flex items-center gap-2 mb-2 text-slate-700">Giá trị tài sản (VNĐ)</label>
                                <input 
                                    type="number" 
                                    value={propertyPrice}
                                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-lg font-bold text-slate-800 transition"
                                />
                            </div>
                            <div>
                                <label className="font-bold flex items-center gap-2 mb-2 text-slate-700">Vốn tự có sẵn có (VNĐ)</label>
                                <input 
                                    type="number" 
                                    value={ownCapital}
                                    onChange={(e) => setOwnCapital(Number(e.target.value))}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-lg font-bold text-slate-800 transition"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="font-bold flex items-center gap-2 mb-2 text-slate-700">Lãi suất (%/năm)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={interestRateAnnual}
                                    onChange={(e) => setInterestRateAnnual(Number(e.target.value))}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-lg font-bold text-slate-800 transition"
                                />
                            </div>
                            <div>
                                <label className="font-bold flex items-center gap-2 mb-2 text-slate-700">Thời gian vay (Năm)</label>
                                <input 
                                    type="number" 
                                    value={loanTermYears}
                                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-lg font-bold text-slate-800 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="font-bold flex items-center gap-2 mb-2 text-slate-700">Phương thức trả lãi</label>
                            <select 
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as 'decreasing' | 'annuity')}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-lg font-bold text-slate-800 transition bg-white"
                            >
                                <option value="decreasing">Dư nợ giảm dần (Tiền trả ít dần)</option>
                                <option value="annuity">Trả đều (Tiền trả cố định mỗi tháng)</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Results Card */}
                <motion.div 
                  className="lg:col-span-5 relative"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl h-full flex flex-col relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-red-700/20 blur-3xl rounded-full"></div>
                       
                       <h3 className="text-white text-2xl font-black mb-8 pb-6 border-b border-white/10 flex items-center gap-3">
                         <Calculator size={24} className="text-red-500" /> Kết Quả Vay Ước Tính
                       </h3>
                       
                       <div className="space-y-6 flex-grow text-white">
                           <div className="flex items-center justify-between">
                              <span className="text-slate-400 font-medium">Số tiền cần vay từ Ngân hàng:</span>
                              <span className="font-bold text-xl text-yellow-400">{formatCurrency(loanAmount)}</span>
                           </div>
                           
                           <div className="pt-6 mt-4 border-t border-white/10">
                               <span className="text-red-400 font-bold block mb-2 text-sm tracking-wide uppercase">Thanh toán tháng đầu tiên</span>
                               <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                   {formatCurrency(firstMonthPayment)}
                               </div>
                               
                               <div className="bg-black/30 rounded-xl p-4 space-y-3 mt-4 text-sm border border-white/5">
                                   <div className="flex justify-between">
                                      <span className="text-slate-400">Tiền gốc:</span>
                                      <span className="font-bold text-slate-200">{formatCurrency(principalPerMonth)}</span>
                                   </div>
                                   <div className="flex justify-between border-t border-white/5 pt-3">
                                      <span className="text-slate-400">Tiền lãi:</span>
                                      <span className="font-bold text-slate-200">{formatCurrency(firstMonthInterest)}</span>
                                   </div>
                               </div>
                           </div>

                           <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
                              <span className="text-slate-400 font-medium">Tổng tiền lãi cả kỳ:</span>
                              <span className="font-bold text-xl text-yellow-400">{formatCurrency(totalInterest)}</span>
                           </div>
                       </div>
                       
                       <button onClick={exportCSV} className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold flex flex-row items-center justify-center gap-2 transition border border-white/20">
                          <DownloadCloud size={20} /> XUẤT LỘ TRÌNH THANH TOÁN (EXCEL)
                       </button>
                    </div>
                </motion.div>
            </div>
        </div>
      </section>
      
      {/* Lead Capture Section */}
      <section id="contact" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div 
                   initial={{ opacity: 0, x: -30 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Đăng Ký Tư Vấn &<br/><span className="text-red-700">Nhận Bảng Giá File Mềm</span></h2>
                    <p className="text-lg text-slate-600 mb-8">Chúng tôi sẽ gửi bảng phân tích chi tiết dòng tiền, sơ đồ phân lô và pháp lý 100% minh bạch qua Zalo/Email cho bạn hoàn toàn miễn phí.</p>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 text-red-700 rounded-full flex items-center justify-center shrink-0">
                                <PhoneCall size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Hotline 24/7</p>
                                <a href="tel:0988712213" className="text-xl font-bold text-slate-900">0988 712 213</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Zalo OA</p>
                                <a href="https://zalo.me/0988712213" target="_blank" rel="noreferrer" className="text-xl font-bold text-slate-900">Nhắn tin ngay</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-10 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-5 shadow-sm inline-flex pr-12">
                        <img src="https://i.postimg.cc/yd78BR2C/gen-n-z7176066495139-85960b0aac82e747ab4f71a74cde2153.jpg" alt="Thanh Nghiêm" className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white ring-2 ring-red-100" />
                        <div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">THANH NGHIÊM</h4>
                            <p className="text-[11px] font-bold text-red-700 uppercase tracking-widest mt-1">Trao giá trị thực - Vững niềm tin vàng</p>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Đồng hành cùng sự thịnh vượng của bạn</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                   className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn! Yêu cầu đã được gửi.'); }}>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên *</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input required type="text" placeholder="Nhập tên của bạn" className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại / Zalo *</label>
                            <div className="relative">
                                <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input required type="tel" placeholder="09xx xxx xxx" className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition bg-white" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition transform hover:-translate-y-1">
                            <Send size={18} /> NHẬN BẢNG BÁO GIÁ
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Floating Elements (Audio + CTA) */}
      <div className="fixed bottom-6 left-6 z-[200]">
          <audio ref={audioRef} loop>
              <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
          </audio>
          <button onClick={toggleMusic} className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 border-red-700 hover:scale-110 transition text-red-700 focus:outline-none">
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </button>
      </div>

      <div className="fixed bottom-6 right-6 md:right-8 flex flex-col gap-4 z-[200]">
        <a href="https://zalo.me/0988712213" target="_blank" rel="noreferrer" className="w-14 h-14 md:w-16 md:h-16 bg-[#0068FF] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition animate-bounce ml-auto">
            <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
        </a>
        <a href="tel:0988712213" className="group flex items-center gap-3 bg-red-700 text-white pl-4 pr-3 py-3 md:pl-6 md:pr-4 md:py-4 rounded-full shadow-2xl hover:bg-red-800 hover:-translate-y-1 transition">
            <span className="font-bold text-sm md:text-base whitespace-nowrap">GỌI TƯ VẤN: 0988 712 213</span>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition">
                <PhoneCall className="w-4 h-4 md:w-5 md:h-5 text-white animate-pulse" />
            </div>
        </a>
      </div>
      
    </div>
  );
}