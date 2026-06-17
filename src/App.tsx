import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import RawGas from '@/pages/RawGas';
import ShiftDecarb from '@/pages/ShiftDecarb';
import Refining from '@/pages/Refining';
import Synthesis from '@/pages/Synthesis';
import Separation from '@/pages/Separation';
import Production from '@/pages/Production';
import Energy from '@/pages/Energy';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/raw-gas" element={<RawGas />} />
        <Route path="/shift-decarb" element={<ShiftDecarb />} />
        <Route path="/refining" element={<Refining />} />
        <Route path="/synthesis" element={<Synthesis />} />
        <Route path="/separation" element={<Separation />} />
        <Route path="/production" element={<Production />} />
        <Route path="/energy" element={<Energy />} />
      </Routes>
    </Router>
  );
}
