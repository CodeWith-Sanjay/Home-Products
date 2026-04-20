import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from "./pages/HomePage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import KitchenProductsPage from './pages/KitchenProductsPage.jsx';
import LivingRoomProductPage from './pages/LivingRoomProductPage.jsx';
import BedRoomProductsPage from './pages/BedRoomProductsPage.jsx';
import CategoryProductsPage from './pages/CategoryProductsPage.jsx';
import CartPage from './pages/CartPage.jsx';

import { CartProvider } from './context/CartContext/CartProvider.jsx'
import WishListPage from './pages/WishListPage.jsx';
import { WishListProvider } from './context/WishListContext/WishListProvider.jsx';
import SellerPortalPage from './pages/SellerPortalPage.jsx';
import SellerLoginPage from './components/SellerDashboard/SellerLoginPage.jsx';
import SellerRegistration from './components/SellerDashboard/SellerRegistration.jsx';
import SellerOverview from './components/SellerDashboard/SellerOverview.jsx';
import SellerProducts from './components/SellerDashboard/SellerProducts.jsx';
import SellerOrders from './components/SellerDashboard/SellerOrders.jsx';
import SellerCustomers from './components/SellerDashboard/SellerCustomers.jsx';
import SellerSettings from './components/SellerDashboard/SellerSettings.jsx';
import SellerAnalytics from './components/SellerDashboard/SellerAnalytics.jsx';
import SellerPayments from './components/SellerDashboard/SellerPayments.jsx';
import SellerMessages from './components/SellerDashboard/SellerMessages.jsx';

import AddProduct from './components/SellerDashboard/AddProduct.jsx';
import EditProduct from './components/SellerDashboard/EditProduct.jsx';
import DeleteProduct from './components/SellerDashboard/DeleteProduct.jsx';
import CheckoutSinglePage from './pages/CheckoutSinglePage.jsx';
import OrderPlaced from './components/CheckoutPage/OrderPlaced.jsx';
import Onboarding from './components/SellerDashboard/SellerOnboarding/Onboarding.jsx';
import { ProductProvider } from './context/ProductContext/ProductProvider.jsx';
import { OnboardingProvider } from './context/OnboardingContext/OnboardingProvider.jsx';
import ProfilePage from './components/ProfilePage/ProfilePage.jsx';
import CustomerLogin from './components/CustomerLogin/CustomerLogin.jsx';
import CustomerRegister from './components/CustomerLogin/CustomerRegister.jsx';
import CustomerOnboarding from './components/CustomerLogin/CustomerOnboarding.jsx';

function App() {

  return (
    <div 
    className="bg-gray-50">
      <MainApp />
    </div>
  )
}

function MainApp() {
  return (
      <BrowserRouter>
      <OnboardingProvider>
      <ProductProvider>
      <CartProvider>
        <WishListProvider>
         <Routes>
          <Route path='/' element={<HomePage />}/>
          <Route path='/cart' element={<CartPage />}/>
          <Route path='/product/:slug' element={<ProductPage />}/>
          <Route path='/kitchen-products' element={<KitchenProductsPage />} />
          <Route path='/livingRoom-products' element={<LivingRoomProductPage />} />
          <Route path='/bedRoom-products' element={<BedRoomProductsPage />} />
          <Route path='/category/:room' element={<CategoryProductsPage />} />
          <Route path='/wishlist' element={<WishListPage />} />
          <Route path='/profile' element={<ProfilePage />} />

          <Route path='/checkout' element={<CheckoutSinglePage />} />
          <Route path='/order-success' element={<OrderPlaced />} />
          <Route path='/seller/login' element={<SellerLoginPage />}/>
          <Route path='/seller/register' element={<SellerRegistration />} />
          <Route path='/seller/onboarding' element={<Onboarding />} />

          <Route path='/customer-login' element={<CustomerLogin />}/>
          <Route path='/customer-register' element={<CustomerRegister />}/>
          <Route path='/customer-onboarding' element={<CustomerOnboarding />} />


          <Route path="products/add" element={<AddProduct />} />
<Route path="products/edit/:id" element={<EditProduct />} />
<Route path="products/delete/:id" element={<DeleteProduct />} />

          <Route path='/seller' element={<SellerPortalPage />}>
          <Route index element={<SellerOverview />} />
          <Route path='products' element={<SellerProducts />}/>
          <Route path='orders' element={<SellerOrders />}/>
          <Route path='customers' element={<SellerCustomers />}/>
          <Route path='analytics' element={<SellerAnalytics />}/>
          <Route path='payments' element={<SellerPayments />}/>
          <Route path='messages' element={<SellerMessages />}/>
          <Route path='settings' element={<SellerSettings />}/>
          </Route>
         </Routes>
         </WishListProvider>
      </CartProvider>
      </ProductProvider>
      </OnboardingProvider>
      </BrowserRouter>
  )
}

export default App
