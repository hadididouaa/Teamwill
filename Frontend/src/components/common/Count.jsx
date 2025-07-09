import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { InView } from "react-intersection-observer";

const Count = ({ number }) => {
  const [focus, setFocus] = useState(false);

  return (
    <InView triggerOnce onChange={(inView) => inView && setFocus(true)}>
      {({ ref }) => (
        <span ref={ref}>
          <CountUp
            start={0}
            end={focus ? number : 0}
            duration={2}
            decimals={number % 1 !== 0 ? 1 : 0}
          />
        </span>
      )}
    </InView>
  );
};

export default Count;
