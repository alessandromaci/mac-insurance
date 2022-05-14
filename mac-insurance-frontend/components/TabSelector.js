import { useState } from "react";
import { Markets } from "./Markets";
import { NoWalletDashboard } from "./NoWalletDashboard";
import { Pool } from "./Pool";
import { TabButtonContainer } from "./TabButtonContainer";
import { WalletDashboard } from "./WalletDashboard";

export const TabSelector = ({ walletConnected }) => {
  const [selected, setSelected] = useState("Dashboard");

  const renderTab = () => {
    switch (selected) {
      case "Markets":
        return <Markets />;
      case "Pool":
        return <Pool />;
      default:
        return !walletConnected ? <NoWalletDashboard /> : <WalletDashboard />;
    }
  };
  return (
    <>
      <TabButtonContainer getter={selected} setter={setSelected} />
      {renderTab()}
    </>
  );
};
