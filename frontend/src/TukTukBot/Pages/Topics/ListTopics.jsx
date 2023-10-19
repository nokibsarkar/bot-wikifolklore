import CategoryList from "../../components/Category";

const AddTask = () => {
    const categories = [
        {
            name : 'Category 1'
        },
        {
            name : 'Category 2'
        }
    ];
    return <CategoryList categories={categories} onRemove={console.log} />
}
export default AddTask