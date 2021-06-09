/* 
  간단한 서버 요청 & 데이터 가공
  iterative한 요청으로 연속된 많은 요청을 보낸다.
  과도한 트래픽 문제를 유발할 수 있음
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
    // 블로그 데이터 파싱
    const blogUpdated = await Promise.all(
      blogs.map(async (blog) => {
        try {
          // 서버 요청
          const [resUser, resComment] = await Promise.all([
            await axios.get(`${serverURI}/user/${blog.user}`),
            await axios.get(`${serverURI}/blog/${blog._id}/comment`),
          ]);
          // 블로그의 유저 객체 정보 저장
          blog.user = resUser.data.user;
          // 블로그의 comment들의 유저 객체 정보 저장
          blog.comments = await Promise.all(
            resComment.data.comments.map(async (comment) => {
              try {
                // 서버 요청
                const {
                  data: { user },
                } = await axios.get(`${serverURI}/user/${comment.user}`);
                comment.user = user;
                return comment;
              } catch (err) {
                console.error(err);
              }
            })
          );
          return blog;
        } catch (err) {
          console.error(err);
        }
      })
    );
    // 객체 상세 확인
    // console.dir(blogUpdated[0].comments, { depth: 3 });
  } catch (error) {
    console.error(error);
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
testGroup();
