import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Exchange from "../../src/components/OpenShelf/Views/Exchange";
import Home from "../../src/components/OpenShelf/Views/Home";
import Shelf from "../../src/components/OpenShelf/Views/Shelf";

const OpenShelf: NextPage = () => {
  const router = useRouter();
  const [exchangeData, setExchangeData] = useState<string>("");
  const [buyState, setBuyState] = useState<boolean>(true);
  const [selected, setSelected] = useState<1 | 2 | 3>(1);
  useEffect(() => {
    const setPage = async () => {
      if (router.query.selected) {
        switch (router.query.selected as string) {
          case "1":
            setSelected(1);
            break;
          case "2":
            setSelected(2);
            break;
          case "3":
            router.query.data && setExchangeData(router.query.data as string);
            router.query.buyState === "false" && setBuyState(false);
            setSelected(3);
            break;
          default:
            break;
        }
      }
    };
    setPage().then();
  }, []);

  useEffect(() => {
    if (selected == 3) {
      setExchangeData("");
    }
  }, [selected]);

  if (selected == 1) {
    return <Home selected={selected} setSelected={setSelected} />;
  } else if (selected == 2) {
    return <Shelf selected={selected} setSelected={setSelected} />;
  } else if (selected == 3) {
    return (
      <Exchange
        selected={selected}
        setSelected={setSelected}
        exchangeData={exchangeData}
        initialBuyState={buyState}
      />
    );
  }
};

export default OpenShelf;
