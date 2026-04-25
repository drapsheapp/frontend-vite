import Dashboard from "../admin/pages/Dashboard";
import Orders from "../admin/pages/Orders";
import OrderDetail from "../admin/pages/OrderDetail";
import AdminProducts from "../admin/pages/Products";
import Customers from "../admin/pages/Customers";
import CustomerDetail from "../admin/pages/CustomerDetail";
import AddProduct from "../admin/pages/AddProduct";
import EditProduct from "../admin/pages/EditProduct";
import Categories from "../admin/pages/Categories";
import AddCategory from "../admin/pages/AddCategory";
import EditCategory from "../admin/pages/EditCategory";
import AdminCollections from "../admin/pages/AdminCollections";
import AddCollection from "../admin/pages/AddCollection";
import EditCollection from "../admin/pages/EditCollection";
import AdminAnalytics from "../admin/pages/AdminAnalytics";

export const adminRoutes = [
  { path: "dashboard", element: <Dashboard /> },
  { path: "orders", element: <Orders /> },
  { path: "orders/:id", element: <OrderDetail /> },
  { path: "products", element: <AdminProducts /> },
  { path: "products/new", element: <AddProduct /> },
  { path: "products/edit/:id", element: <EditProduct /> },
  { path: "categories", element: <Categories /> },
  { path: "categories/new", element: <AddCategory /> },
  { path: "categories/edit/:id", element: <EditCategory /> },
  { path: "collections", element: <AdminCollections /> },
  { path: "collections/new", element: <AddCollection /> },
  { path: "collections/edit/:id", element: <EditCollection /> },
  { path: "customers", element: <Customers /> },
  { path: "customers/:id", element: <CustomerDetail /> },
  { path: "analytics", element: <AdminAnalytics /> }
];