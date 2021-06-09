/* 
  백엔드에서 모든 작업을 처리하도록 한다.
  Populate를 사용하여 미리 처리한 데이터를 클라이언트 측에서 사용한다.
*/

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
