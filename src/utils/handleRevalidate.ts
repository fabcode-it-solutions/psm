export const handleRevalidate = async (tag: string) => {
  await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tag: tag }),
  });
};
