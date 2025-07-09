import Count from "../../common/Count";

const count_data = [
   {
      id: 1,
      count: 100,
      count_text: "K+",
      text: "Active Students"
   },
   {
      id: 2,
      count: 50,
      count_text: "+",
      text: "Faculty Courses"
   },
   {
      id: 3,
      count: 75,
      count_text: "K",
      text: "Best Professors"
   },
   {
      id: 4,
      count: 30,
      count_text: "K",
      text: "Award Achieved"
   },
];

const Counter = () => {
   return (
      <section className="fact__area">
         <div className="container">
            <div className="fact__inner-wrap">
               <div className="row">
                  {count_data.map((item) => (
                     <div key={item.id} className="col-lg-3 col-6">
                        <div className="fact__item">
                           <h2 className="count"><Count number={item.count} />{item.count_text}</h2>
                           <p>{item.text}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   );
}

export default Counter;
