import React from 'react';
import { FLAGS } from '../lib/flags';
export default function SafeModeBanner(){
  if (FLAGS.LIVE_CHAT || FLAGS.AI_SUMMARIES || FLAGS.ESTIMATOR_AI) return null;
  return (
    <div style={{
      position:'fixed',left:12,bottom:12,background:'#111',color:'#fff',
      padding:'6px 10px',borderRadius:6,opacity:0.8,fontSize:12,zIndex:99999
    }}>
      Safe Mode: AI features disabled
    </div>
  );
}
