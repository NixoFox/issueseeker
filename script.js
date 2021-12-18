if (localStorage.getItem("first") == null) {
    localStorage.setItem("per_page", 25);
    localStorage.setItem("order", "desc");
    localStorage.setItem("sort", "created");
    localStorage.setItem("filters", "is:open,");
    localStorage.setItem("auth", "");
    localStorage.setItem("first", false);
}

let filter_list = localStorage.getItem("filters").split(",");
filter_list.pop();

function toggleModal (id) {
    if (document.getElementById(id).style.display != "block") {
        document.getElementById(id).style.display = "block";
    } else {
        document.getElementById(id).style.display = "none";
    }
}

function addFilterInput () {
    document.getElementById("filter-list").innerHTML += `<div class="input-group">
        <label>filter ${document.getElementById("filter-list").children.length + 1}:</label>
        <input type="text" class="filter" />
        <input type="button" value="Remove" onclick="removeFilterInput(this)" />
    </div>`;
}

function removeFilterInput (el) {
    el.parentElement.remove();
}

function showSettings () {
    document.getElementById("filter-list").innerHTML = "";
    for (let i = 0; i < filter_list.length; i++) {
        document.getElementById("filter-list").innerHTML += `<div class="input-group">
        <label>filter ${i + 1}:</label>
            <input type="text" class="filter" value='${filter_list[i].replace("+", " ")}' />
            <input type="button" value="Remove" onclick="removeFilterInput(this)" />
        </div>`;
    }
    document.getElementById("auth").value = localStorage.getItem("auth");
    document.getElementById("per_page").value = localStorage.getItem("per_page");
    document.getElementById("sort").value = localStorage.getItem("sort");
    switch (localStorage.getItem("order")) {
        case "asc":
            document.getElementById("order").value = "Ascending";
            break;
        case "desc":
            document.getElementById("order").value = "Descending";
    }
}

function saveSettings () {
    let filters_save = "";
    let filters_inputs = document.getElementsByClassName("filter");
    for (let i = 0; i < filters_inputs.length; i++) {
        filters_save += filters_inputs.item(i).value.replace(" ", "+") + ",";
    }
    localStorage.setItem("filters", filters_save);
    localStorage.setItem('auth', document.getElementById('auth').value);
    if (document.getElementById('per_page').value != "" && parseInt(document.getElementById('per_page').value) > 0) {
        localStorage.setItem('per_page', document.getElementById('per_page').value);
    } else {
        localStorage.setItem('per_page', "25");
    }
    localStorage.setItem('sort', document.getElementById('sort').value);
    switch (document.getElementById("order").value) {
        case "Ascending":
            localStorage.setItem('order', "asc");
            break;
        case "Descending":
            localStorage.setItem('order', "desc");
    }
    window.reload();
}

let url = window.location.href.split("#");

function nextPage () {
    if (url.length == 1) {
        window.location.assign(url[0] + "#1");
    } else {
        window.location.assign(url[0] + "#" + (parseInt(url[1]) + 1));
    }
    location.reload();
}

function prevPage () {
    if (url.length == 1) {
        window.location.assign(url[0] + "#1");
    } else {
        window.location.assign(url[0] + "#" + (parseInt(url[1]) - 1));
    }
    location.reload();
}

async function fetchjson (url) {
    if (localStorage.getItem("auth") != "") {
        return fetch(url, { headers: { authorization: "token " + localStorage.getItem("auth") } })
        .then((response) => {if (response.status == 200) { return response } else { toggleModal("error") }})
        .then((data) => {return data.json()});
    } else {
    return fetch(url)
        .then((response) => {if (response.status == 200) { return response } else { toggleModal("error") }})
        .then((data) => {return data.json()});
    }
}

async function main () {
    if (url.length == 1) {
        url.push("1");
    }
    for (let k = 0; k < filter_list.length; k++) {
        let issues = await fetchjson("https://api.github.com/search/issues?per_page="+Math.floor(localStorage.getItem("per_page")/filter_list.length)+"&page="+url[1]+"&q=is:issue+"+filter_list[k]+"&order="+localStorage.getItem("order")+"&sort="+localStorage.getItem("sort"));
        let items = issues.items;
        for(let i = 0; i < items.length; i++) {
            let item = items[i];
            let user = "";
            let user_url = "";
            let repo = "";
            let repo_url = "";
            let lang = "";
            let repo_data = await fetchjson(item.repository_url);
            user = repo_data.owner.login;
            user_url = repo_data.owner.html_url;
            repo = repo_data.name;
            repo_url = repo_data.html_url;
            lang = repo_data.language;
            let repo_desc = repo_data.description;
            if (repo_desc === null) {
                repo_desc = "";
            }
            let title = item.title;
            let url = item.html_url;
            let labels = "";
            for (let j = 0; j < item.labels.length; j++) {
                labels += `<span>${item.labels[j].name}</span>\n`;
            }
            let element = `<div class="issue">
            <h3><a href="${user_url}">${user}</a>/<a href="${repo_url}">${repo}</a></h3>
            <h2><a href="${url}">${title}</a></h2>
            <span class="lang">${lang}</span>
            ${labels}
            <p>${repo_desc}</p>
            </div>`;
            document.getElementsByClassName("issues").item(0).innerHTML += element;
        }
    }
}

main();
