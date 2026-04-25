import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import OrdersTab from "../tabs/OrdersTab";
import MeasurementsTab from "../tabs/MeasurementsTab";
import AddressTab from "../tabs/AddressTab";
import AlterationsTab from "../tabs/AlterationsTab";
import WalletTab from "../tabs/WalletTab";

const ProfileTabs = () => {
  return (
    <Tabs defaultValue="orders">
      <TabsList className="mb-6">
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="measurements">Measurements</TabsTrigger>
        <TabsTrigger value="addresses">Addresses</TabsTrigger>
        <TabsTrigger value="alterations">Alterations</TabsTrigger>
        <TabsTrigger value="wallet">Wallet</TabsTrigger>
      </TabsList>

      <TabsContent value="orders"><OrdersTab /></TabsContent>
      <TabsContent value="measurements"><MeasurementsTab /></TabsContent>
      <TabsContent value="addresses"><AddressTab /></TabsContent>
      <TabsContent value="alterations"><AlterationsTab /></TabsContent>
      <TabsContent value="wallet"><WalletTab /></TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;