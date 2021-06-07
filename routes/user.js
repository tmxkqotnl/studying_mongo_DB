import express from 'express';
import {User} from '../model/User';
import {isValidObjectId} from 'mongoose';
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userData = await User.find({});

    if (userData.length === 0) {
      return res.status(200).json({
        message: "유저 정보가 없습니다.",
      });
    } else {
      return res.status(200).json({
        user: userData,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message,
    });
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId))
      return res.status(400).json({
        message: "유효하지 않은 유저입니다.",
      });

    const user = await User.findOne({ _id: req.params.userId });
    
    if (!user) {
      return res.status(400).json({
        message: "유저가 존재하지 않습니다.",
      });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      err: err.message,
    });
  }
});
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    if (!user.name || !user.name.firstName || !user.name.lastName) {
      return res.status(400).json({
        err: "이름이 필요합니다.",
      });
    }
    if (!user.email) {
      return res.status(400).json({
        err: "이메일이 필요합니다.",
      });
    }
    const savedUser = await user.save();
    return res.status(200).json({
      user: savedUser,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "중복된 이메일입니다.",
      });
    }

    console.error(err);
    return res.status(500).json({
      error: err.message,
    });
  }
});
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId))
      return res.status(400).json({
        message: "유효하지 않은 유저입니다.",
      });

    const delData = await User.findByIdAndDelete({ _id: userId });
    if (!delData) {
      return res.status(400).json({
        message: "유저가 존재하지 않습니다.",
      });
    }
    return res.status(200).json({
      user: delData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message,
    });
  }
});
// find and update
/* router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { age, firstName } = req.query;
    if (!isValidObjectId(userId))
      return res.status(400).json({
        message: "유효하지 않은 유저입니다.",
      });
    if(!age || ! firstName){
      return res.status(400).json({
        message:"나이와 이름이 필요합니다."
      });
    }
    if(!typeof age !== "number" || typeof firstName !== 'string'){
      return res.status(400).json({
        message:"나이는 숫자만, 이름은 문자만 가능합니다."
      });
    }
    const modifedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { age: age, "name.firstName": firstName } },
      { new: true }
    );
    if (!modifedUser) {
      return res.status(400).json({
        message: "유저가 존재하지 않습니다.",
      });
    }
    return res.status(200).json({ modifedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: err.message,
    });
  }
}); */

/* 
  update by 'save'
  DB와 서버를 2번 교차해야하기 때문에 어쩌면 비효율적일 수 있다.
  mongoose 내장 기능(에러 검출)을 이용하려면 이 방법을 사용
*/

router.put('/:userId',async (req,res)=>{
  try{
    const {userId} = req.params;
    const {age} = req.query;
    const user = await User.findById(userId);
    if(!user){
      return res.status(400).json({
        message:"no user info",
      });
    }
    if(age) user.age = age;
    //user.name = {}; 
    await user.save(); 
    
    return res.json({user});
  }catch(err){
    console.log(err);
    if(err._message.includes("validation failed")){
      return res.status(400).json({
        message:"입력 오류"
      })
    }
  }
});

export default router;
