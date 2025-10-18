import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import CasePage from '../pages/journey/CasePage';

export function JourneyPreviewRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/case-v2" element={<CasePage />} />
      </Routes>
    </HashRouter>
  );
}
