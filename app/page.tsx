import Navbar from "./components/Navbar";

export default function Home() {

  return (
    <>
      <Navbar></Navbar>
      <header className="bg-cover bg-center bg-no-repeat py-40" style={{ backgroundImage: 'url("https://restlesspilgrim.net/blog/wp-content/uploads/2017/11/Fathers.jpg")' }}>
        <div className="max-w-screen-lg mx-auto text-center text-white p-4 border-2 border-white rounded-lg bg-black bg-opacity-50">
            <h1 className="text-5xl font-bold mb-4 shadow">Welcome to Divine Doctrine</h1>
            <h2 className="text-xl font-semibold shadow-md">Spreading the eternal truths of the Early Christian Church, established by the apostles, to uplift and inspire Christians globally.</h2>
        </div>
      </header>
      <div className="max-w-screen-lg mx-auto mt-8">
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">
                    <a href="/similarity" className="text-blue-500 hover:text-blue-700">Text Similarities</a>
                </h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">This page helps you explore the writings of early Christian leaders stored in the database, known as Church Fathers. It offers a way to see what these historical figures wrote and how their writings connect to the Bible.</p>
                    <p className="text-sm text-gray-600">This page gives you two different ways to see how the Bible Reference relates to the text.</p>
                    <ul>
                        <li><p className="text-sm text-gray-600">Similarity Score: A numerical value indicating how closely the Church Father's text relates to the Bible verse, using the text embedding using Google's model text-embedding-004</p>
                        </li>
                        <li><p className="text-sm text-gray-600">Reference Type: Whether the reference is a direct or indirect citation of the Bible verse. </p>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">
                    <a href="/search" className="text-blue-500 hover:text-blue-700">Search</a>
                </h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">Search through the NKJV Bible or all the writings stored on this website from the Church Fathers.</p>
                    <p className="text-sm text-gray-600">Through the use of Google's model text-embedding-004, and semantic search techniques, allows you to search the Bible for what you are searching for through the meaning of the phrase instead of finding the exact order of the phrase</p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">
                    <a href="/classification" className="text-blue-500 hover:text-blue-700">Classification</a>
                </h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">This page is to show you the 4 different models that were trained and what data was used to train them.</p>
                </div>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">
                    <a href="/add-text" className="text-blue-500 hover:text-blue-700">Add Text</a>
                </h2>
                <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-sm text-gray-600">This page is so that you can see the magic happen, where you can add text from a church father, and see a verse be extracted. Classify the text and be able to be able to parse this text in the search page after adding it.</p>
                </div>
            </div>
        </div>
    </>
  );
}
