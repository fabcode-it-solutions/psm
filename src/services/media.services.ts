export const mediaService = {
    getMediaById: async ( {id }: {
            id: number         
        } ) => {
              try {   
  
            const response = await fetch(
                `/api/media/${id}`,
                { method: "GET" }
            );
            const result = await response.json();
  
            return result.data;
        } catch ( error ) {
            console.error( "Error fetching brands:", error );
        }
        }
}