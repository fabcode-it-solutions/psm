export const defaultService = {
    fetchBrands: async ( { currentPage,
        itemsPerPage,
        searchTerm, }: {
            currentPage?: string,
            itemsPerPage?: string,
            searchTerm?: string
        } ) => {
        try {
            const params = new URLSearchParams();
            if ( currentPage ) {
                params.append( "page", currentPage);
            }
            if ( itemsPerPage ) {
                params.append( "limit", itemsPerPage )
                
            }

            if ( searchTerm ) params.append( "search", searchTerm );
            params.append( "includeBuilds", "true" );
            const response = await fetch(
                `/api/admin/cars/brands?${ params.toString() }`,
                { method: "GET" }
            );
            const result = await response.json();
            return result;
        } catch ( error ) {
            console.error( "Error fetching brands:", error );
        }
    },
       fetchCategories: async ( { currentPage,
        itemsPerPage,
        searchTerm, }: {
            currentPage?: string,
            itemsPerPage?: string,
            searchTerm?: string
        } ) => {
        try {
            const params = new URLSearchParams();
            if ( currentPage ) {
                params.append( "page", currentPage);
            }
            if ( itemsPerPage ) {
                params.append( "limit", itemsPerPage )
                
            }
            if ( searchTerm ) params.append( "search", searchTerm );
     
            const response = await fetch(
                `/api/admin/categories?${ params.toString() }`,
                { method: "GET" }
            );
            const result = await response.json();
            return result;
        } catch ( error ) {
            console.error( "Error fetching brands:", error );
        }
    },
     fetchModels: async ( { currentPage,
        itemsPerPage,
        searchTerm, brandId }: {
            currentPage?: string,
            itemsPerPage?: string,
            searchTerm?: string
            brandId?: string
        } ) => {
        try {
            const params = new URLSearchParams();
            if ( currentPage ) {
                params.append( "page", currentPage);
            }
            if ( itemsPerPage ) {
                params.append( "limit", itemsPerPage )
                
            }

            if ( searchTerm ) params.append( "search", searchTerm );
            params.append( "includeBuilds", "true" );
            if(brandId){
            params.append( "brandId", brandId );
            }
            
            const response = await fetch(
                `/api/admin/cars/models?${ params.toString() }`,
                { method: "GET" }
            );
            const result = await response.json();
            return result;
        } catch ( error ) {
            console.error( "Error fetching brands:", error );
        }
    },
    fetchModelsTypes: async ( { currentPage,
        itemsPerPage,
        searchTerm, modelId }: {
            currentPage?: string,
            itemsPerPage?: string,
            searchTerm?: string
            modelId?: string
        } ) => {
        try {
            const params = new URLSearchParams();
            if ( currentPage ) {
                params.append( "page", currentPage);
            }
            if ( itemsPerPage ) {
                params.append( "limit", itemsPerPage )
                
            }

            if ( searchTerm ) params.append( "search", searchTerm );
            params.append( "includeBuilds", "true" );
            if(modelId){
            params.append( "modelId", modelId );
            }
            
            const response = await fetch(
                `/api/admin/cars/types?${ params.toString() }`,
                { method: "GET" }
            );
            const result = await response.json();
            return result;
        } catch ( error ) {
            console.error( "Error fetching brands:", error );
        }
    },
     fetchManufacturers: async ( { currentPage,
        itemsPerPage,
        searchTerm }: {
            currentPage?: string,
            itemsPerPage?: string,
            searchTerm?: string
        } ) => {
        try {
            const params = new URLSearchParams();
            if ( currentPage ) {
                params.append( "page", currentPage);
            }
            if ( itemsPerPage ) {
                params.append( "limit", itemsPerPage )
                
            }

            if ( searchTerm ) params.append( "search", searchTerm );
            params.append( "includeBuilds", "true" );
                 
            const response = await fetch(
                `/api/admin/cars/manufacturers?${ params.toString() }`,
                { method: "GET" }
            );
            const result = await response.json();
            return result;
        } catch ( error ) {
            console.error( "Error fetching brands:", error );
        }
    },
}