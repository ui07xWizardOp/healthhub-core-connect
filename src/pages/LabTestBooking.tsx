
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLabTestCart } from '@/contexts/LabTestCartContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LabTestBooking: React.FC = () => {
  const { cartItems, removeFromCart, cartCount, totalPrice } = useLabTestCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 md:py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Lab Test Cart</h1>
            <p className="text-lg text-gray-600">Review your selected tests and proceed to booking.</p>
          </div>

          {cartCount === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-700">Your cart is empty</h2>
              <p className="text-gray-500 mt-2 mb-6">You haven't added any lab tests to your cart yet.</p>
              <Button asChild>
                <Link to="/lab-tests">Browse Tests</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const id = item.type === 'test' ? item.testid : item.panelid;
                  const name = item.type === 'test' ? item.testname : item.panelname;
                  const description = item.description || 'No description available.';

                  return (
                    <Card key={`${item.type}-${id}`} className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold">{name}</h3>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-lg">₹{item.price?.toFixed(2)}</p>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(id, item.type)}>
                          <Trash2 className="h-5 w-5 text-red-500" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal ({cartCount} {cartCount > 1 ? 'items' : 'item'})</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="lg">Proceed to Book</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabTestBooking;
