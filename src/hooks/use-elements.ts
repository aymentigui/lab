export const useElementsToData = (components: any) => {
    return components.map(({ id, type }: any) => {
        if (type === 'text') {
            const textEditor = document.querySelector('#text-' + id);
            if (textEditor)
                textEditor.classList.toggle('hidden');
            const contentOfTextEditor = { type, value: document.querySelector(`#text-${id}`)?.outerHTML }
            if (textEditor)
                textEditor.classList.toggle('hidden');
            return contentOfTextEditor;
        }
        if (type === 'file') {
            // @ts-ignore
            return { type, value: document.querySelector(`#file-${id}`)?.files[0] };
        }
        if (type === 'image' || type === 'video') {
            // @ts-ignore
            const file = document.querySelector(`#file-${id}`)?.files[0]
            let preview = URL.createObjectURL(file)
            // @ts-ignore
            // return { type, value: document.querySelector(`#file-${id}`)?.files[0] };
            return { type, value: preview };
        }
        //@ts-ignore
        if (type === 'title') return { type, value: document.querySelector(`#title-${id}`)?.value };
        //@ts-ignore
        if (type === 'space') return { type, value: document.querySelector(`#space-${id}`)?.value };
        if (type === 'table') {
            const tableElement = document.querySelector(`#table-${id}`);
            if (tableElement) {
                // Clone the table element
                const clonedTable = tableElement.cloneNode(true) as HTMLElement;

                // Remove the delete buttons for rows and columns
                const deleteButtons = clonedTable.querySelectorAll('.no-need');
                deleteButtons.forEach(button => button.remove());

                const inputsTable = clonedTable.querySelectorAll('.no-edit');
                inputsTable.forEach(button => {
                    // @ts-ignore
                    button.disabled = true
                });

                return { type, value: clonedTable.outerHTML };
            }
        }
        return { type, value: null };
    });
}

export const useElementsToHtml = (components: any) => {
    let content = "";
    components.forEach((component: any) => {
        if (component.type === 'title') {
            //@ts-ignore
            content += `<h1 class='text-2xl font-semibold'>${component.value}</h1>`;
        } else if (component.type === 'text') {
            content += component.value || "";
        } else if (component.type === 'space') {
            const h = Number(component.value)>0 ? component.value : 0
            content += `<div style="height:${h}px"></div>`;
        } else if (component.type === 'table') {
            content += component.value || "";
        } else if (['video', 'file'].includes(component.type)) {
            //@ts-ignore
            const file = document.querySelector(`#file-${id}`)?.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                if (component.type === 'image') content += `<img src="${url}" alt="uploaded image" />`;
            }
        }
        else if (['image'].includes(component.type)) {
            //@ts-ignore
            const preview = component.value;
            console.log(preview)
            if (preview) {
                // const url = URL.createObjectURL(file);
                if (component.type === 'image') content += `<img src="${preview}" alt="uploaded image" />`;
            }
        }
    })
    return content;
}