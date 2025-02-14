import React, { useEffect, useState } from 'react';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_KEY, SearchRequest, User, formatDateTime, isEmpty, token } from 'src/utils';
import img1 from 'src/assets/images/undraw_blooming_re_2kc4.svg';
import img2 from 'src/assets/images/undraw_doctor_kw-5-l.svg';
import img3 from 'src/assets/images/undraw_medical_care_movn.svg';
import img4 from 'src/assets/images/undraw_medicine_b-1-ol.svg';
import img5 from 'src/assets/images/undraw_professor_re_mj1s.svg';
import img6 from 'src/assets/images/undraw_questions_re_1fy7.svg';
import img_heard from 'src/assets/images/undraw_a_whole_year_vnfm.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DialogCommon from 'src/components/DialogCommon/DialogCommon';
import { ToastError, ToastSuccess } from 'src/utils/toastOptions';
import { LinearProgress, Typography } from '@mui/material';
import dayjs from 'dayjs';

const NOT_VALID_REGISTER_MESSAGE =
   'Bạn không đủ điều kiện để đăng kí, đợi một khoảng thời gian sau hoặc liên hệ admin để biết thêm chi tiết!';

function RequestItem({ data }: { data: SearchRequest }) {
   const navigate = useNavigate();
   const imageRandomMapping = {
      1: img1,
      2: img2,
      3: img3,
      4: img4,
      5: img5,
      6: img6,
   };

   const isLogin =
      !!localStorage.getItem('token') &&
      !!localStorage.getItem('userId') &&
      !!localStorage.getItem('currentUser');

   const [result, setResult] = useState(null);

   const [isLoading, setIsLoading] = useState<boolean>(false);

   const currentUser = JSON.parse(localStorage.getItem('currentUser')) as unknown as User;

   useEffect(() => {
      axios
         .get<{ data: string }>(`${API_KEY}/volunteer/checkregister?id=${currentUser?.userId}`, {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         })
         .then(res => setResult(res?.data?.data))
         .catch(err => {
            console.log(err?.message);
         });
   }, [currentUser?.userId]);

   const [open, setOpen] = useState<boolean>(false);

   const onConfirm = () => {
      result !== 0 ? ToastError(NOT_VALID_REGISTER_MESSAGE) : setOpen(true);
   };

   const handleRegister = () => {
      if (isLogin) {
         if (isEmpty(currentUser?.fullname)) {
            ToastError('Vui cập nhật thông tin cá nhân của bạn!');
            return navigate('/profile');
         }
         onConfirm();
      } else {
         navigate('/login');
      }
   };
   const today = dayjs();
   const dataRequestDate = dayjs(data?.requestDate);

   const handleCheckDay = () => {
      if (dataRequestDate?.isValid()) {
         if (today?.isAfter(dataRequestDate)) {
            return ToastError('Ngày hiện tại lớn hơn ngày tổ chức hiến máu');
         }
         return true;
      }
      return ToastError('Khoảng thời gian của buổi hiến máu không hợp lệ!');
   };

   const handleYes = async () => {
      if (!isLogin) return navigate('/login');

      if (result !== 0) {
         return ToastError(NOT_VALID_REGISTER_MESSAGE);
      }

      if (!handleCheckDay()) {
         return setOpen(false);
      }

      setIsLoading(true);
      axios
         .post<{ data: string }>(
            `${API_KEY}/volunteer/register`,
            {
               volunteerid: localStorage.getItem('userId'),
               requestid: data.requestid,
            },
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         )
         .then(res => {
            ToastSuccess('Đăng kí thành công !!!');
            setOpen(false);
            setIsLoading(false);
            setResult(null);
            window.location.reload();
            navigate('/home');
         })
         .catch(err => {
            console.log(err?.message);
            ToastError('Đăng kí không thành công !!!');
            setIsLoading(false);
         });
   };

   return (
      <div>
         <div className='container'>
            <div className='row'>
               <div className='col-lg-12'>
                  <div className='recent-activities card'>
                     <div className='card-close'>
                        <div className='dropdown'>
                           <button
                              type='button'
                              className='btn'
                              data-toggle='dropdown'
                              aria-haspopup='true'
                              style={{
                                 color: '#811315',
                                 border: '1px solid #811315',
                                 borderRadius: '4px',
                              }}
                              onClick={e => {
                                 e.stopPropagation();
                                 e.preventDefault();
                                 handleRegister();
                              }}
                              aria-expanded='false'
                           >
                              Đăng kí
                           </button>
                        </div>
                     </div>
                     <div className='card-header'>
                        <h3 className='h4'>
                           Buổi hiến máu số {data?.requestid} tại {data?.hospitals?.nameHospital}
                        </h3>
                     </div>
                     <div className='card-body no-padding'>
                        <div className='item'>
                           <div className='row'>
                              <div className='col-2'>
                                 <div className='d-flex justify-content-center align-items-center'>
                                    <img
                                       src={imageRandomMapping[Math.floor(Math.random() * 6) + 1]}
                                       alt='hinh_anh_buoi_hien_mau'
                                    />
                                 </div>
                              </div>
                              <div className='col-8 content row align-items-center'>
                                 <div className='col-8'>
                                    <Typography variant='h5' className='mb-3'>
                                       Tên địa điểm: {data?.hospitals?.nameHospital}
                                    </Typography>
                                    <Typography variant='body1' className='mb-1'>
                                       Địa chỉ: {data?.address}
                                    </Typography>
                                    <Typography variant='body1'>
                                       Thời gian hoạt động: {data?.endtime}
                                       <div className='icon'>
                                          <i className='fa fa-clock-o'></i>
                                       </div>
                                    </Typography>
                                    <Typography variant='body1'>
                                       Thời gian hiến máu: {formatDateTime(data?.requestDate)}
                                       <div className='icon'>
                                          <i className='fa fa-clock-o'></i>
                                       </div>
                                    </Typography>
                                    <Typography variant='body2' className='mt-1'>
                                       Chúng tôi cần: {Math.round(data?.quantity)} người cho cuộc
                                       hiến máu này!
                                    </Typography>
                                 </div>
                                 <div className='col-4'>
                                    <Typography variant='body1'>
                                       Số lượng đăng kí đạt: {Math.round(data?.total)} %
                                    </Typography>
                                    <LinearProgress
                                       variant='determinate'
                                       value={data?.total}
                                       color='secondary'
                                    />
                                    <img src={img_heard} alt='img_heard' />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <DialogCommon
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={handleYes}
            isLoading={isLoading}
            content='Bạn có muốn đăng kí hiến máu tại bệnh viện này?'
         />
      </div>
   );
}
export default RequestItem;
