import Navbar from "./components/Navbar";

export default function Home() {

  return (
    <>
      <Navbar></Navbar>
      <div className="max-w-screen-lg mx-auto mt-8">
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Text Similarities:</h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">This screen size is typically for smartphones in portrait mode. It's important to ensure that your website or application is responsive and user-friendly on small screens.</p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Search:</h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">This screen size is commonly used for tablets and larger smartphones in landscape mode. It's important to optimize layouts and content to provide a good user experience on these devices.</p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Classification:</h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">This screen size is often used for laptops and desktops. It allows for more content to be displayed at once, but it's still important to consider responsive design principles for various screen resolutions.</p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Add Text:</h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">This screen size is typically used for large desktop monitors. It provides ample space for content and allows for more complex layouts. However, it's still important to ensure that content remains readable and accessible.</p>
                </div>
            </div>
        </div>
    </>
  );
}
