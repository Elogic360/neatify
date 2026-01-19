import { createElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SiteShell from '../components/layout/SiteShell'

import HomePage from '../pages/HomePage'
import ProductsPage from '../pages/ProductsPage'
import ProductDetailPage from '../pages/ProductDetail'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import OrderConfirmationPage from '../pages/OrderConfirmationPage'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import PoliciesPage from '../pages/PoliciesPage'

import AdminLayoutEnhanced from '../components/admin/AdminLayoutEnhanced'
import {
  DashboardPage,
  ProductListPage,
  ProductFormPage,
  OrderListPage,
  OrderDetailPage,
  UserListPage,
  UserDetailPage,
  AnalyticsPage,
} from '../pages/admin'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<SiteShell />}> 
        <Route path="/" element={createElement(HomePage)} />
        <Route path="/products" element={createElement(ProductsPage)} />
        <Route path="/products/:id" element={createElement(ProductDetailPage)} />
        <Route path="/cart" element={createElement(CartPage)} />
        <Route path="/checkout" element={createElement(CheckoutPage)} />
        <Route path="/order/:id" element={createElement(OrderConfirmationPage)} />
        <Route path="/about" element={createElement(AboutPage)} />
        <Route path="/contact" element={createElement(ContactPage)} />
        <Route path="/policies" element={createElement(PoliciesPage)} />

        <Route path="/admin" element={<AdminLayoutEnhanced />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="users" element={<UserListPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
