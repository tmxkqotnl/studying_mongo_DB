import MONGO_URI_P from './production';
import MONGO_URI_D from './development';

let key = '';
if(process.env.NODE_ENV === 'production'){
  key = MONGO_URI_P;
}else{
  key = MONGO_URI_D;
}
export const Key = key;