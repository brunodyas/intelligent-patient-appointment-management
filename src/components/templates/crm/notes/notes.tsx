import React, { useMemo, useState } from "react";
import { Button, Input } from "@/components/atomics";
import Spinner from "@/components/atomics/Spinner";
import { renderNotes } from "./notesList";
import { Note } from "@/interface/contacts";

interface NotesProps {
  notes: Note[];
  handleSubmit: (note: string) => Promise<void>;
}

const Notes = (props: NotesProps) => {
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isDisabled = useMemo(() => !note || isSubmitting, [note, isSubmitting]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await props.handleSubmit(note);
    setIsSubmitting(false);
    setNote("");
  };

  return (
    <div className="border rounded-md shadow-small py-5 px-5">
      <p className=" font-semibold text-lg">Notes</p>
      <div className="grid w-full grid-cols-1 gap-6 items-end justify-center justify-items-center py-5">
        <Input
          id="note"
          variant="default"
          placeholder=""
          value={note}
          handleChange={(e) => setNote(e.target.value)}
        />
        <div className="w-full sm:w-2/4">
          <Button
            size="md"
            className="w-full !h-10"
            variant="primary-bg"
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            {isSubmitting ? (
              <>
                <Spinner /> Submitting
              </>
            ) : (
              "Submit New Note"
            )}
          </Button>
        </div>
      </div>
      {props.notes && props.notes.map((note) => renderNotes(note))}
    </div>
  );
};

export default Notes;
