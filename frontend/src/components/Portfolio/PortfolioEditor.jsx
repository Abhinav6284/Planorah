import React from 'react';
import PortfolioEditorLegacy from './PortfolioEditorLegacy';
import PortfolioEditorV2 from './PortfolioEditorV2';

const isPortfolioV2Enabled = process.env.REACT_APP_PORTFOLIO_V2_EDITOR !== 'false';

export default function PortfolioEditor() {
  if (!isPortfolioV2Enabled) {
    return <PortfolioEditorLegacy />;
  }
  return <PortfolioEditorV2 />;
}
