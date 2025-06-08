using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ProjectManagementAPI.Controllers
{
    public class ProjectDto
    {
        [Required]
        public string name { get; set; }
        public string description { get; set; }
        public string status { get; set; }
        public object[] stagements { get; set; }
        public DateTime? createdAt { get; set; }
        public int id { get; set; } // 新增 id 屬性
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private static List<ProjectDto> projects = new()
        {
            new ProjectDto
            {
                id = 1,
                name = "測試專案",
                description = "這是測試",
                status = "進行中",
                stagements = new object[0],
                createdAt = DateTime.UtcNow
            }
        };

        [HttpGet]
        public IActionResult Get()
        {
            return Ok(projects);
        }

        [HttpPost]
        public IActionResult Post([FromBody] ProjectDto project)
        {
            // 驗證必填欄位
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    error = "資料格式錯誤",
                    details = ModelState
                });
            }

            try
            {
                var newProject = new ProjectDto
                {
                    id = projects.Count + 1,
                    name = project.name,
                    description = project.description ?? "尚未填寫描述",
                    status = project.status ?? "進行中",
                    stagements = project.stagements ?? new object[0],
                    createdAt = project.createdAt ?? DateTime.UtcNow
                };
                projects.Add(newProject);
                return CreatedAtAction(nameof(Get), new { id = newProject.id }, newProject);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "伺服器內部錯誤",
                    details = ex.Message
                });
            }
        }
    }
}
