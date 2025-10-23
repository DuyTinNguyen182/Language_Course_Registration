import { useEffect, useState } from 'react';
import { Button, Table, Flex, Breadcrumb, Modal, Form, Input, Select, Spin, message, Result } from 'antd';
import axios from 'axios';

import { Link } from "react-router-dom";
import { useAuth } from '../../../context/AuthContext';

function CourseManager() {
    const [open, setOpen] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [courses, setCourses] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [languagelevel, setlanguagelevel] = useState([]);
    const [spinning, setSpinning] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();

    const [selectedLanguageId, setSelectedLanguageId] = useState(null);
    const [form] = Form.useForm();

    const { state } = useAuth();
    const { currentUser } = state;

    useEffect(() => {
    if (open) {
        form.resetFields();
    }
    }, [open]);



    const columns = [  
        {
            title: 'Mã khóa học',
            dataIndex: 'courseid',
        },     
        {
            title: 'Ngôn ngữ',
            dataIndex: 'language_id',
            render: (langId) => {
                const lang = languages.find(l => l._id === langId);
                return lang ? lang.language : langId;
            },
            filters: languages.map(lang => ({
                text: lang.language,
                value: lang._id,
            })),
            onFilter: (value, record) => record.language_id === value,
        },
        {
            title: 'Trình độ',
            dataIndex: 'languagelevel_id',
            render: (lglvId) => {
                const lv = languagelevel.find(c => c._id === lglvId);
                return lv ? lv.language_level : lglvId;
            }
        },
        {
            title: 'Giảng viên',
            dataIndex: 'teacher_id',
            render: (teacherId) => {
                const teacher = teachers.find(t => t._id === teacherId);
                return teacher ? teacher.full_name : teacherId;
            },
            width: 200,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'Start_Date',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '',
        },
        {
            title: 'Số tiết',
            dataIndex: 'Number_of_periods',
        },
        {
            title: 'Học phí (VNĐ)',
            dataIndex: 'Tuition',
            render: (fee) => fee?.toLocaleString() + ' ₫'
        },
        {
            title: 'Mô tả',
            dataIndex: 'Description',
            width: 250,
        },    
        {
            title: 'Sửa',
            dataIndex: 'id',
            render: (_, record) => (
                <Link to={`update/${record.id}`}>Sửa</Link>
            ),
            width: 60,
            align: "center"
        }
    ];

    

    const fetchData = () => {
        setSpinning(true);
        Promise.all([
            axios.get('http://localhost:3005/api/course', { withCredentials: true }),
            axios.get('http://localhost:3005/api/language', { withCredentials: true }),
            axios.get('http://localhost:3005/api/teacher', { withCredentials: true }),
            axios.get('http://localhost:3005/api/languagelevel', { withCredentials: true }),
        ])
        .then(([courseRes, langRes, teacherRes, languagelevelRes]) => {

            setCourses(courseRes.data.map(course => ({
                ...course,
                key: course.id,
            })));
            setLanguages(langRes.data);
            setTeachers(teacherRes.data);
            setlanguagelevel(languagelevelRes.data);
            setSpinning(false);       
            setFilteredCourses(courseRes.data)
        })
        .catch(err => {
            console.error(err);
            setSpinning(false);
        });
    };

    useEffect(() => {
        fetchData();        
    }, []);

    const showModal = () => setOpen(true);
    const showDeleteConfirm = () => setOpenDeleteConfirm(true);

    const handleDelete = () => {
        setSpinning(true);
        setOpenDeleteConfirm(false);

        axios.delete(`http://localhost:3005/api/course/multiple`, {
            data: { courseIds: selectedRowKeys },
            withCredentials: true
        })
        .then(() => {
            messageApi.success("Xóa khóa học thành công");
            fetchData();
            setSelectedRowKeys([]);
        })
        .catch(err => console.log(err))
        .finally(() => setSpinning(false));
    };

    const onFinish = (values) => {
        setSpinning(true);

        axios.post(`http://localhost:3005/api/course`, values, {
            withCredentials: true
        })
        .then(() => {
            fetchData()
            messageApi.success("Thêm khóa học mới thành công")
            form.resetFields()
            setOpen(false)
        })
        .catch(error => {
            const errorMsg = error.response?.data?.message || error.message                    
            messageApi.error(errorMsg);
        })
        .finally(() => setSpinning(false));
    };

    const handleSearch = (value) => {
        const keyword = value?.toString().toLowerCase().trim();
        //console.log(teachers)

        if (!keyword) {
            setFilteredCourses(courses);
            return;
        }

        const filtered = courses.filter(courses =>
            String(courses.courseid || '').toLowerCase().includes(keyword)
        );

        setFilteredCourses(filtered);
    };

    if (!currentUser || currentUser.role !== 'Admin') {
        return (
            <Result
                status="403"
                title="403 - Forbidden"
                subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
                extra={
                    <Link to="/">
                        <Button type="primary">Quay về Trang chủ</Button>
                    </Link>
                }
            />
        );
    }

    return (
        <Flex vertical gap={20} style={{ position: "relative" }}>
            {contextHolder}
            <Spin spinning={spinning} fullscreen />
            <Breadcrumb items={[{ title: 'Admin Dashboard' }, { title: 'Quản lý khóa học' }]} />

            <Flex gap={20}>
                <Button type="primary" onClick={showModal}>Thêm khóa học</Button>                            
                <Input.Search
                    placeholder="Tìm theo mã khóa học"
                    allowClear                    
                    onChange={(e) => handleSearch(e.target.value.toString())}
                    style={{ width: 250 }}
                />                
            </Flex>

            {selectedRowKeys.length > 0 && (
                <Flex align='center' justify='space-between' style={{ backgroundColor: "#fff", padding: 10, borderRadius: 5, boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
                    <span>Đã chọn {selectedRowKeys.length} khóa học</span>
                    <Button danger onClick={showDeleteConfirm}>Xoá</Button>
                </Flex>
            )}

            <Table
            rowKey="id"
            rowSelection={{
                selectedRowKeys,
                onChange: (selectedKeys) => {
                    //console.log("Selected:", selectedKeys);
                    setSelectedRowKeys(selectedKeys);
                    }
            }}
            columns={columns}
            dataSource={filteredCourses}
            bordered
            />

            {/* Modal xác nhận xoá */}
            <Modal
                open={openDeleteConfirm}
                title="Xác nhận xoá"
                onCancel={() => setOpenDeleteConfirm(false)}
                footer={[
                    <Button key="back" onClick={() => setOpenDeleteConfirm(false)}>Quay lại</Button>,
                    <Button key="submit" danger type="primary" onClick={handleDelete}>Xoá</Button>,
                ]}
                centered
            >
                <p>{selectedRowKeys.length} khóa học sẽ bị xoá vĩnh viễn. Tiếp tục?</p>
            </Modal>

            {/* Modal thêm mới */}
            <Modal
                open={open}
                title="Thêm khóa học mới"
                onCancel={() => setOpen(false)}
                footer={null}
                centered
            >
                <Form 
                    form={form}
                    layout="vertical" 
                    onFinish={onFinish}
                >
                    <Form.Item name="language_id" label="Ngôn ngữ" rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ!' }]}>
                        <Select placeholder="Chọn ngôn ngữ" onChange={(value) => setSelectedLanguageId(value)}>                        
                            {languages.map(lang => (
                                <Select.Option key={lang._id} value={lang._id}>{lang.language}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="languagelevel_id" label="Trình độ" rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}>
                        <Select placeholder="Chọn trình độ">
                            {languagelevel.map(cat => (
                                <Select.Option key={cat._id} value={cat._id}>{cat.language_level}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="teacher_id" label="Giảng viên" rules={[{ required: true, message: 'Vui lòng chọn giảng viên!' }]}>
                        <Select placeholder="Chọn giảng viên">
                            {teachers
                                .filter(teacher => teacher.language_id._id === selectedLanguageId)
                                .map(teacher => (
                                    <Select.Option key={teacher.id} value={teacher._id}>
                                        {teacher.full_name}                                        
                                    </Select.Option>                                    
                                ))}
                        </Select>                        
                    </Form.Item>      

                    <Form.Item 
                        name="Start_Date" 
                        label="Ngày bắt đầu" 
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày bắt đầu!' },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();

                                    const selectedDate = new Date(value);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);

                                    if (selectedDate < today) 
                                    {
                                        return Promise.reject("Ngày bắt đầu không được nhỏ hơn ngày hôm nay!");
                                    }

                                    return Promise.resolve();
                                }
                            }
                        ]}>

                        <Input type="date" />
                    </Form.Item>

                    <Form.Item 
                        name="Number_of_periods" 
                        label="Số tiết" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập số tiết!' },
                            {
                                validator: (_, value) => {
                                    if (value === undefined || value === null || value === '') 
                                    {
                                        return Promise.resolve();
                                    }

                                    if (Number(value) <= 0) 
                                    {
                                        return Promise.reject('Số tiết phải là số dương!');
                                    }

                                    return Promise.resolve();
                                }
                            }
                        ]}>

                        <Input type="number" min={1} />
                    </Form.Item>

                    <Form.Item 
                        name="Description" 
                        label="Mô tả"
                    >
                        <Input.TextArea rows={3} allowClear />
                    </Form.Item>

                    <Form.Item 
                        name="Tuition" 
                        label="Học phí (VNĐ)" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập học phí!' },
                            {
                                validator: (_, value) => {
                                    if (value === undefined || value === null || value === '') 
                                    {
                                        return Promise.resolve();
                                    }

                                    if (Number(value) <= 0) 
                                        {
                                        return Promise.reject('Học phí phải là số dương!');
                                    }

                                    return Promise.resolve();
                                }
                            }
                        ]}>

                        <Input type="number" min={0} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>Tạo khóa học</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Flex>
    );
}

export default CourseManager;
