# Search Page Flow Design in React

## **Overview**

This document outlines the detailed event flow and key concepts for creating a performant search page in React using TypeScript. The page will consist of a search form (with multiple input types) and a table for displaying the search results. It includes pagination, and ensures the state is preserved when navigating back or reloading. The page will be optimized for performance with smooth input handling and quick search.

## **1. Component Structure**

### **Search Form**

- **Components**: `Select`, `Input`, `Checkbox`, `DatePicker`
- **Functionality**:

  - The user can enter/search using various form fields such as:

    - **Select** (with options fetched via an API)
    - **Input** (for free text search)
    - **Checkbox** (for filtering options)
    - **DatePicker** (for selecting date ranges)

- **Handling Input Changes**:

  - Each input will be controlled by **React Hook Form**.
  - When any field is changed, we update the search parameters in the form state.
  - **Debouncing** will be applied on the input fields to prevent excessive API calls during typing (using libraries like `use-debounce` or `lodash.debounce`).
  - **State Update**: On form change, we update the query parameters in the URL using `useSearchParams` (React Router).

### **Table**

- **Table UI**: `Ant Design Table` for displaying data.
- **Pagination**:

  - A pagination component will be placed below the table.
  - The page size will default to `50`, but can be changed by the user.
  - Pagination and the page size will sync with the URL so that when the user navigates back or reloads, the table state remains the same.
  - **Lazy Loading**: If the data size is large, we may use **lazy loading** or **suspense** to improve rendering times.

### **API Requests**:

Use axios(src/lib/axios.ts) auth + tanstack query

- **Search Form Data API**(url select=forms/selects): This will be used to fetch available options for the `Select` component. Select can infinity scroll when current page < total page
  BACKEND WILL BE:
  URL: path("forms/selects", views.FormSelectsView.as_view()),
  class FormSelectsView(APIView):
  @extend_schema(
  parameters=[
  OpenApiParameter("field", str, required=True),
  OpenApiParameter("search", str, required=False),
  OpenApiParameter("page", int, required=False),
  OpenApiParameter("pageSize", int, required=False),
  ],
  responses=SelectOptionSerializer(many=True)
  )
  def get(self, request):
  .....
  return Response({
  "data": serializer.data,
  "currentPage": page,
  "totalPages": (total + page_size - 1) // page_size
  })
- **Search Results API**: This will be used to fetch data for the table based on the selected search criteria (page, page size, and filters).
  BACKEND WILL BE:
  URL: path("forms/search", views.FormSearchView.as_view()),
  class FormSearchView(APIView):
  @extend_schema(
  parameters=[
  OpenApiParameter("page", int, required=False),
  OpenApiParameter("pageSize", int, required=False),
  OpenApiParameter("application_no", str, required=False),
  OpenApiParameter("title", str, required=False),
  OpenApiParameter("status", str, required=False),
  OpenApiParameter("manager", str, required=False),
  OpenApiParameter("customer_code", str, required=False),
  OpenApiParameter("register_date_start", str, required=False, description="yyyy-mm-dd"),
  OpenApiParameter("register_date_end", str, required=False, description="yyyy-mm-dd"),
  OpenApiParameter("category", str, required=False),
  ],
  responses=FormSearchResultSerializer(many=True)
  )
  def get(self, request):
  ......

  ```json
  {
    "data": [...], // Data for the table
    "page": 1, // Current page number
    "recordTotal": 1000, // Total records available
    "recordFilter": 200 // Records that match the filters
  }
  ```

  - The API will support filtering, pagination, and dynamic field handling based on query parameters (e.g., `page`, `pageSize`).
    Table UI example:
    Page size and page info in the left of bottom table
    Pagination in the right of bottom table
    | Header |
    |---|---|---|---|---|---|---|
    | Content |
    PageSize(left), PageInfo(left) Pagenation(right)

## **2. Event Flow**

### **A. Initial Page Load**

1. **Page loads**: When the page first loads, the search form state is populated by default or based on the URL parameters (if any).

   - For example, if the URL has parameters like `?page=2&pageSize=50`, the form and table will use those values to set up the initial state.
   - **URL sync**: The `useSearchParams` hook (from React Router) will read these values from the URL and set the form state accordingly.

2. **Initial Search Request**:

   - Once the page is loaded, an initial search request will be triggered by calling the `useQuery` hook (TanStack Query) to fetch data for the table.
   - The parameters passed will include the current search form state, such as `page`, `pageSize`, and any filter values.

3. **Rendering Table**:

   - The table will render with the data returned from the API.
   - The pagination will reflect the current page and page size. The user will also be able to navigate through pages using pagination controls.

### **B. Search Button Click**

1. **User Interaction**:

   - When the user clicks the **Search** button, the following happens:

     - **Form Data**: The form fields are validated and the new filter criteria are captured.
     - **URL Sync**: The search parameters (e.g., `page`, `pageSize`, `searchText`) are updated in the URL using `useSearchParams` from React Router. This ensures that the state is preserved across page reloads and back button navigation.
     - **API Call**: A new API request is triggered using the updated search parameters.
     - The table data is updated based on the API response.

2. **Response Handling**:

   - The API response includes the new data for the table, updated pagination information, and total records.
   - The **table** will render with the new data.
   - The **pagination** component will be updated with the correct page and page size information.
   - If the page size has changed, the table will adjust accordingly.

### **C. Pagination Interaction**

1. **User Interaction**:

   - When the user clicks a pagination control (next page, previous page, or a specific page number), the following happens:

     - The page number (`page`) is updated in the URL using `useSearchParams`.
     - The `useQuery` hook automatically triggers a new request for the corresponding page of data.
     - The table is updated with the new data and pagination information.

### **D. Page Size Change**

1. **User Interaction**:

   - When the user changes the **page size** (e.g., from 50 to 100 records per page), the following happens:

     - The page size is updated in the URL using `useSearchParams`.
     - The `useQuery` hook triggers a new request with the updated `pageSize`.
     - The table renders with the new page size.

### **E. Input Field Changes**

1. **Debounced Search**:

   - As the user types in the search fields (e.g., text input), a debounce is applied (using `use-debounce` or `lodash.debounce`) to prevent multiple API calls.
   - Once the user stops typing, the search parameters are updated in the URL.
   - A new search request is triggered using the updated parameters, and the table is updated.

### **F. Reload and Back Navigation**

1. **Preserved State**:

   - When the user navigates back or reloads the page, the parameters from the URL (e.g., `page`, `pageSize`, search filters) are read by `useSearchParams`.
   - The state of the search form and table will be reset to these values, and the table will re-render with the previously fetched data.

2. **Data Re-fetching**:

   - The API request will be triggered based on the URL parameters, ensuring that the user sees the correct data and state after reloading or navigating back.

## **3. Performance Considerations**

### **A. Optimization**

- **Memoization**: Use `React.memo` and `useMemo` to prevent unnecessary re-renders of the table and form components.
- **Debouncing**: Apply debouncing to input fields to reduce the number of API calls made while typing.
- **Lazy Loading**: Use `React.lazy` and `Suspense` for code splitting, ensuring that only the necessary components are loaded when required.

### **B. Data Caching**:

- Use **TanStack Query**'s caching mechanism to avoid refetching data unnecessarily when the user navigates back to the page.
- **Query Invalidation**: When a new search request is made, invalidate the previous query to ensure fresh data is fetched.

## **4. Tools and Libraries**

| Goals                     | Recommended Tools                       |
| ------------------------- | --------------------------------------- |
| Routing + URL sync        | ✅ React Router (`useSearchParams`)     |
| Data query (search/table) | ✅ TanStack Query (`useQuery`)          |
| Debounce input            | ✅ `use-debounce`, `lodash.debounce`    |
| Form control              | ✅ React Hook Form                      |
| Table UI                  | ✅ Ant Design Table, Pagination         |
| Memoization               | ✅ React.memo, `useMemo`, `useCallback` |
| State on reload/back      | ✅ Sync with URL + TanStack Query cache |
| Lazy Loading/Suspense     | ✅ React.lazy, Suspense                 |

---

This document provides a clear flow of how the search page should function, ensuring that the user experience is smooth, the state is preserved, and the page is optimized for performance. You can use this design to implement the page with the specified technologies.
