"use client";

import { LoadingIcon, UploadSimpleIcon } from "@/assets/icons";
import { Button, Input } from "@/components/atomics";
import { Modal } from "@/components/molecules";
import Tag from "@/components/Tag";
import { useFeed } from "@/hooks/feed/useFeed";
import { createPost } from "@/services/feed";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useJune } from "@/hooks/useJune";

interface FormData {
  title: string;
  content: string;
  image: string | null; // Base64 string
  tags: string[];
  subcategories: string;
}

type Props = {
  SetOpenCreatePost: (value: boolean) => void;
  openCreatePost: boolean;
  fetchData: () => void;
};

const DEFAULT_DATA: FormData = {
  title: "",
  content: "",
  image: null,
  tags: [],
  subcategories: "",
};

const CreatePostModal = ({
  openCreatePost,
  SetOpenCreatePost,
  fetchData,
}: Props) => {
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { fileName, blob, reset, handleChangeFile } = useFeed();
  const analytics = useJune();

  const tags = [
    {
      label: "Just for fun",
      color: "#F4CCCC",
    },
    {
      label: "Announcements",
      color: "#DAE8FC",
    },
    {
      label: "Feature Suggestion",
      color: "#E6E0EC",
    },
    {
      label: "Tips",
      color: "#EAD1DC",
    },
    {
      label: "Events",
      color: "#D9EAD3",
    },
    {
      label: "Question",
      color: "#FFF2CC",
    },
  ];

  const subcategories = [
    {
      label: "Biz dev",
      color: "#CFE2F3",
    },
    {
      label: "Product",
      color: "#FCE5CD",
    },
    {
      label: "General",
      color: "#D9D2E9",
    },
    {
      label: "Motorization",
      color: "#F9CB9C",
    },
  ];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.content) newErrors.content = "Content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsLoading(true);
      const response = await createPost({
        ...formData,
        ...(blob && { image: blob }),
      });
      analytics?.track("createPost");
      response && setIsLoading(false);
      fetchData();
      SetOpenCreatePost(false);
    } catch (e) {
      throw e;
    } finally {
      setIsLoading(false);
      setFormData(DEFAULT_DATA);
      reset();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChangeTextArea = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleButtonClick = (tag: string) => {
    setFormData((prevState) => {
      const isTagSelected = prevState.tags.includes(tag);
      const updatedTags = isTagSelected
        ? prevState.tags.filter((t) => t !== tag)
        : [tag];

      const updatedSubcategories = tag !== "Question" ? "" : prevState.subcategories;

      return {
        ...prevState,
        tags: updatedTags,
        subcategories: updatedSubcategories,
      };
    });
  };

  const handleButtonClickSubcategories = (subcategories: string) => {
    setFormData((prevState) => {
      const isSubcategoriesSelected = prevState.subcategories === subcategories;
      const updatedSubcategories = isSubcategoriesSelected ? "" : subcategories;

      return {
        ...prevState,
        subcategories: updatedSubcategories,
      };
    });
  };

  const { getRootProps } = useDropzone({
    onDrop: (files) => {
      const imageFiles = files?.filter(file => file?.type?.startsWith('image/'));
      if(imageFiles?.length) {
        handleChangeFile(imageFiles);
      }
    },
  });

  const isQuestionTag: boolean = useMemo(
    () => formData.tags.includes("Question"),
    [formData]
  );

  return (
    <Modal
      variant="primary"
      className="border-2 border-primary-border"
      title={"Create Post"}
      open={openCreatePost}
      setOpen={SetOpenCreatePost}
    >
      <div className="relative space-y-6 p-6">
        <main className="my-10 flex flex-col items-center justify-center gap-10">
          <nav className="relative w-full">
            <section className="flex items-start justify-center gap-20 max-md:gap-12 max-smx:gap-8 max-sm:gap-5 max-xsm:gap-2">
              <div className="grid w-full grid-cols-1 max-smx:grid-cols-1 gap-6">
                <Input
                  id="title"
                  variant={
                    errors.title && !formData?.title
                      ? "default-error"
                      : "default"
                  }
                  label="Title"
                  message={!formData?.title ? errors.title : ""}
                  placeholder="Enter Title"
                  handleChange={handleChange}
                />
                <Input
                  id="content"
                  type="textarea"
                  variant={
                    errors.content && !formData?.content
                      ? "default-error"
                      : "default"
                  }
                  label="Content"
                  message={!formData?.content ? errors.content : ""}
                  placeholder="Enter Content"
                  handleTextAreaChange={handleChangeTextArea}
                />
                <div>
                  <div
                    className={`text-sm font-semibold text-neutral-100 max-sm:text-xs my-2`}
                  >
                    Tag
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((item, index) => (
                      <div key={index} className="px-1">
                        <Tag
                          label={item.label}
                          color={item.color}
                          handleButtonClick={handleButtonClick}
                          isSelect={formData.tags.includes(item.label)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div
                    className={`text-sm font-semibold text-neutral-100 max-sm:text-xs my-2`}
                  >
                    Subcategories
                  </div>
                  {isQuestionTag && (
                    <div className="flex flex-wrap gap-1">
                      {subcategories.map((item, index) => (
                        <div key={index} className="px-1">
                          <Tag
                            label={item.label}
                            color={item.color}
                            handleButtonClick={handleButtonClickSubcategories}
                            isSelect={formData.subcategories.includes(
                              item.label
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label
                  className={`text-sm font-semibold text-neutral-100 max-sm:text-xs`}
                >
                  Image
                </label>
                <div
                  {...getRootProps({ className: "dropzone" })}
                  className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-netral-30 bg-netral-15 py-8"
                >
                  <UploadSimpleIcon className="mb-5 h-8 w-8 text-netral-50" />

                  <Button size="sm" variant="primary-bg" className="mb-2">
                    Choose File
                  </Button>
                  <h5 className="text-xs text-netral-50">
                    {fileName ? fileName : "or drop file to upload"}
                  </h5>
                </div>
              </div>
            </section>
          </nav>
        </main>

        <footer className="flex justify-end gap-3">
          <Button
            className="w-24 !h-10"
            size="md"
            variant="primary-bg"
            onClick={async () => handleSubmit()}
            // disabled={disabled}
          >
            {isLoading ? <LoadingIcon /> : "Submit"}
          </Button>
        </footer>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
