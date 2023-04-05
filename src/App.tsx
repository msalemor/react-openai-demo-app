import React, { useEffect, useState } from "react";
import axios from "axios";
import Product from "./interfaces/products";

const App = () => {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [_, setMyForceUpdate] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [count, setCount] = useState(0);

  // Supporting functions
  const getProductDescription = (product: Product): string => {
    let description = `${product.make} ${product.model} ${product.color} for $${product.price}`;
    product.features.forEach((feature) => {
      description += ` with ${feature}`;
    });
    description += ` and ${product.warranty} warranty`;
    return description;
  };

  const onClear = () => {
    setCount(0);
    setProcessing(false);
    setProducts([]);
  };

  const onLoad = async () => {
    console.info("Loading products");
    let res = await axios.get("/assets/electronics.json");
    const data = res.data;
    console.info(res.data);
    setProducts(data);
  };

  const onProcess = () => {
    setProcessing(true);
    setCount(products.length);

    console.info("Processing sales descriptions");
    products.forEach(async (product) => {
      let description = getProductDescription(product);
      let prompt = "Get a sales description for " + description;
      console.info(prompt);
      const postURI =
        "https://alemorchat.openai.azure.com/openai/deployments/davinci/completions?api-version=2022-12-01";
      let res: any = await axios.post(
        postURI,
        {
          prompt: prompt,
          max_tokens: 300,
          temperature: 0.6,
          n: 1,
          stop: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.REACT_APP_OPENAI_API_KEY,
          },
        }
      );

      let completion = res.data.choices[0].text;
      product.description = completion;
      console.info(product);

      let newCount = count - 1;
      setCount(newCount);
      setMyForceUpdate(Math.random());

      if (newCount <= 0) {
        setProcessing(false);
      }
    });
    console.info("Done processing sales descriptions");
  };

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  // Execute a load time
  useEffect(() => {}, []);

  // Render
  return (
    <div className="App container">
      <h1>Product Description Generator</h1>
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={onLoad}
          disabled={processing}
        >
          Load
        </button>
        <button
          className="btn btn-success m-2"
          onClick={onProcess}
          disabled={processing}
        >
          Process
        </button>
        <button className="btn btn-danger" onClick={onClear}>
          Clear
        </button>{" "}
      </div>
      <div>
        {products.map((product) => (
          <div className="card mb-3" key={product.id}>
            <div className="card-header bg-dark text-light fw-bold">
              {product.make} {product.model} {product.color} for{" "}
              {formatter.format(product.price)}
            </div>
            <div className="card-body bg-light">
              <div className="row">
                <div className="col-md-2">
                  <p className="fw-bold">Features:</p>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.features.join("<br/>"),
                    }}
                  />
                  <br />
                  &nbsp;
                </div>
                <div className="col-md-8">
                  <p className="fw-bold">Description:</p>
                  <p>{product.description}</p>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="fw-bold">Warranty:</span> {product.warranty}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
