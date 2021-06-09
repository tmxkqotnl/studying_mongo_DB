// nesting 방식의 성능 테스트

import axios from "axios";
console.log("client JS ");

const serverURI = "http://localhost:5000";

// 데이터 파싱
const test = async () => {
  console.time("test");
  try {
    // 블로그 정보를 가져옴
    let {
      data: { blogs },
    } = await axios.get(`${serverURI}/blog`);
    //console.log(blogs[0]);
  } catch (err) {
    console.error(err);
  }
  console.timeEnd("test");
};

// 시간 측정
const testGroup = async () => {
  await test();
  await test();
  await test();
  await test();
  await test();
  await test();
  await test();
  await test();
};
// 에러처리 생략
testGroup();
