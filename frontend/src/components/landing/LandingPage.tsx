'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Globe, 
  CheckCircle2,
  ArrowRight,
  Church,
  FileSpreadsheet,
  HeartHandshake,
  Building2
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Pengurusan Anak Kariah',
    description: 'Daftar dan urus maklumat isi rumah, tanggungan, dan ahli kariah dengan mudah.',
  },
  {
    icon: BarChart3,
    title: 'Analitik & Laporan',
    description: 'Papan pemuka interaktif dengan statistik pendapatan, demografi, dan bantuan.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Eksport Data',
    description: 'Muat turun data dalam format Excel atau CSV untuk pelaporan dan analisis lanjut.',
  },
  {
    icon: HeartHandshake,
    title: 'Pengurusan Bantuan',
    description: 'Kenal pasti keluarga memerlukan dan jejaki bantuan yang diberikan.',
  },
  {
    icon: Shield,
    title: 'Selamat & Terjamin',
    description: 'Data disimpan dengan selamat dan hanya boleh diakses oleh pentadbir yang diberi kebenaran.',
  },
  {
    icon: Globe,
    title: 'Subdomain Tersendiri',
    description: 'Setiap masjid mendapat subdomain sendiri seperti masjidanda.i-masjid.my',
  },
];

const benefits = [
  'Pendaftaran percuma dan mudah',
  'Sokongan teknikal dalam Bahasa Malaysia',
  'Kemas kini sistem secara berkala',
  'Data tersimpan di cloud yang selamat',
  'Akses dari mana-mana sahaja',
  'Laporan untuk pihak jabatan agama',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="i-masjid.my Logo" 
                width={40} 
                height={40} 
                className="object-contain"
              />
              <span className="font-bold text-xl text-green-700">i-masjid.my</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Church className="w-4 h-4" />
              Platform Pengurusan Masjid Digital
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Sistem Bancian<br />
              <span className="text-green-600">Anak Kariah Masjid</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Platform digital untuk mengurus data ahli kariah, analitik pendapatan, 
              dan pengurusan bantuan komuniti masjid anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/master/login">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8">
                  Mulakan Sekarang
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Ketahui Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-1 shadow-2xl">
              <div className="bg-white rounded-xl p-4 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  <Card className="bg-green-50 border-green-100">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">150+</div>
                      <div className="text-sm text-gray-600">Masjid Berdaftar</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">5,000+</div>
                      <div className="text-sm text-gray-600">Isi Rumah</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50 border-gray-100">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-gray-700">20,000+</div>
                      <div className="text-sm text-gray-600">Ahli Kariah</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50 border-orange-100">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-orange-600">14</div>
                      <div className="text-sm text-gray-600">Negeri</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ciri-ciri Utama
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Semua yang diperlukan untuk mengurus data ahli kariah masjid anda dengan efisien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-green-200 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Mengapa Pilih i-masjid.my?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Platform yang direka khas untuk keperluan masjid-masjid di Malaysia 
                dengan antara muka mesra pengguna dalam Bahasa Malaysia.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-8">
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Masjid Al-Huda</div>
                    <div className="text-sm text-gray-500">alhuda.i-masjid.my</div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">247</div>
                      <div className="text-sm text-gray-500">Isi Rumah</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">1,032</div>
                      <div className="text-sm text-gray-500">Ahli Kariah</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Sedia untuk Memulakan?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Daftarkan masjid anda sekarang dan mula mengurus data ahli kariah dengan lebih efisien.
          </p>
          <Link href="/master/login">
            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 text-lg px-8">
              Daftar Masjid Anda
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image 
                  src="/logo.png" 
                  alt="i-masjid.my Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                />
                <span className="font-bold text-xl text-white">i-masjid.my</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Platform digital untuk pengurusan bancian anak kariah masjid di Malaysia. 
                Memudahkan pentadbiran dan pelaporan data ahli kariah.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Pautan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Ciri-ciri</Link></li>
                <li><Link href="/master/login" className="hover:text-white transition-colors">Log Masuk</Link></li>
                <li><Link href="/master/login" className="hover:text-white transition-colors">Daftar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Hubungi</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@i-masjid.my</li>
                <li>+60 12-345 6789</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} i-masjid.my. Hak Cipta Terpelihara.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
