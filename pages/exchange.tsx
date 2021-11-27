import { useRouter } from "next/router";
import React from "react";
import { useEffect } from "react";
interface Props {}

const test = (props: Props) => {
  const router = useRouter();
  useEffect(() => {
    router.push(
      {
        pathname: `/OpenShelf`,
        query: router.query,
      },
      `/OpenShelf`
    );
  }, []);
  return <></>;
};

export default test;
